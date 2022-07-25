// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  MenuItem,
  Button,
} from '@mui/material';
import { connect } from 'react-redux';
import { fetchFolderDetails, addFolderData, fetchOwnersData, editFolderData } from '../actions/folders';
import { DOMAIN_ADMIN_WRITE, IPM_SUBTREE_ID, IPM_SUBTREE_OBJECT } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import FolderPermissions from '../components/Dialogs/FolderPermissions';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  grid: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 32,
  },
});

class FolderDetails extends PureComponent {

  state = {
    folder: {},
    readonly: true,
    adding: false,
    snackbar: '',
  };

  types = [
    { name: 'Mail and post items', ID: 'IPF.Note' },
    { name: 'Contact', ID: 'IPF.Contact' },
    { name: 'Appointment', ID: 'IPF.Appointment' },
    { name: 'Sticky note', ID: 'IPF.Stickynote' },
    { name: 'Task', ID: 'IPF.Task' },
  ]

  async componentDidMount() {
    const { fetch, fetchOwners } = this.props;
    const splits = window.location.pathname.split('/');
    const folderId = splits[3];
    // If folder is IPM_SUBTREE
    if(folderId === IPM_SUBTREE_ID) {
      this.setState({ folder: IPM_SUBTREE_OBJECT, readonly: true });
      await fetchOwners(splits[1], IPM_SUBTREE_ID);
    } else {
      const folder = await fetch(splits[1], folderId);
      this.setState({ folder: folder, readonly: false });
      await fetchOwners(splits[1], folder.folderid);
    }
  }

  handleInput = field => event => {
    this.setState({
      folder: {
        ...this.state.folder,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleEdit = () => {
    const { domain } = this.props;
    const { folder } = this.state;
    this.props.edit(domain.ID, {
      ...folder,
      creationtime: undefined,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleAdd = () => this.setState({ adding: true });

  handlePermissionsSuccess = () => this.setState({ snackbar: "Success!" });

  handlePermissionsError = error => this.setState({ snackbar: error });

  handlePermissionsCancel = () => this.setState({ adding: false });

  render() {
    const { classes, t, domain } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { folder, adding, snackbar, readonly } = this.state;

    return (
      <ViewWrapper
        topbarTitle={t('Folders')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('Folder details')}
            </Typography>
          </Grid>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Folder name")} 
              fullWidth 
              value={folder.displayname || ''}
              autoFocus
              onChange={this.handleInput('displayname')}
              disabled={readonly}
            />
            <TextField
              select
              className={classes.input}
              label={t("Container")}
              fullWidth
              value={folder.container || 'IPF.Note'}
              onChange={this.handleInput('container')}
              disabled={readonly}
            >
              {this.types.map((type, key) => (
                <MenuItem key={key} value={type.ID}>
                  {t(type.name)}
                </MenuItem>
              ))}
            </TextField>
            <TextField 
              className={classes.input} 
              label={t("Comment")} 
              fullWidth
              multiline
              variant="outlined"
              rows={4}
              value={folder.comment || ''}
              onChange={this.handleInput('comment')}
              disabled={readonly}
            />
          </FormControl>
          <Grid container className={classes.grid}>
            <Button
              onClick={this.handleAdd}
              disabled={!writable}
              size="large"
              variant='outlined'
            >
              {t('Open permissions')}
            </Button>
          </Grid>
          <Grid container>
            <Button
              color="secondary"
              onClick={this.props.history.goBack}
              style={{ marginRight: 8 }}
            >
              {t('Back')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
              style={{ marginRight: 8 }}
              disabled={!writable || readonly}
            >
              {t('Save')}
            </Button>
          </Grid>
        </Paper>
        {folder.folderid && <FolderPermissions
          open={adding}
          onSuccess={this.handlePermissionsSuccess}
          onError={this.handlePermissionsError}
          onCancel={this.handlePermissionsCancel}
          domain={domain}
          folderID={folder.folderid}
        />}
      </ViewWrapper>
    );
  }
}

FolderDetails.contextType = CapabilityContext;
FolderDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  add: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchOwners: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, folderID) => await dispatch(fetchFolderDetails(domainID, folderID))
      .then(folder => folder)
      .catch(msg => Promise.reject(msg)),
    edit: async (domainID, folder) => await dispatch(editFolderData(domainID, folder))
      .catch(msg => Promise.reject(msg)),
    add: async (domainID, folder) => {
      await dispatch(addFolderData(domainID, folder)).catch(msg => Promise.reject(msg));
    },
    fetchOwners: async (domainID, folderID) => {
      await dispatch(fetchOwnersData(domainID, folderID, { limit: 1000000, level: 0 }))
        .catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(FolderDetails)));
