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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import Add from '@mui/icons-material/AddCircleOutline';
import Delete from '@mui/icons-material/Delete';
import { connect } from 'react-redux';
import { fetchFolderDetails, addFolderData, fetchOwnersData, editFolderData } from '../actions/folders';
import AddOwner from '../components/Dialogs/AddOwner';
import RemoveOwner from '../components/Dialogs/RemoveOwner';
import { DOMAIN_ADMIN_WRITE, IPM_SUBTREE_ID, IPM_SUBTREE_OBJECT } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';

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
  },
});

class FolderDetails extends PureComponent {

  state = {
    folder: {},
    readonly: true,
    adding: false,
    deleting: false,
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
    // If folder is IMP_SUBTREE
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

  handleAddingSuccess = () => {
    const { fetchOwners, domain } = this.props;
    this.setState({ adding: false });
    fetchOwners(domain.ID, this.state.folder.folderid)
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(error => this.setState({ snackbar: error }));
  }

  handleAddingError = error => this.setState({ snackbar: error });

  handleAddingCancel = () => this.setState({ adding: false });

  handleDelete = folder => () => {
    this.setState({ deleting: folder });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => {
    const { fetchOwners, domain } = this.props;
    this.setState({ deleting: false, snackbar: 'Success!' });
    fetchOwners(domain.ID, this.state.folder.folderid)
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(error => this.setState({ snackbar: error }));
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  render() {
    const { classes, t, domain, owners } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { folder, adding, deleting, snackbar, readonly } = this.state;

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
                  {type.name}
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
            <Typography
              color="primary"
              variant="h5"
            >
              {t('Owners')}
            </Typography>
            <IconButton onClick={this.handleAdd} disabled={!writable} size="large">
              <Add fontSize="small" color="primary" />
            </IconButton>
          </Grid>
          <List dense>
            {owners.map((owner, idx) => <React.Fragment key={idx}>
              <ListItem>
                <ListItemText primary={owner.displayName} />
                <IconButton onClick={this.handleDelete(owner)} disabled={!writable} size="large">
                  <Delete fontSize="small" color="error"/>
                </IconButton>
              </ListItem>
              <Divider />
            </React.Fragment>
            )}
          </List>
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
        {folder.folderid && <AddOwner
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          onCancel={this.handleAddingCancel}
          domain={domain}
          folderID={folder.folderid}
        />}
        {folder.folderid && <RemoveOwner
          open={!!deleting}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          ownerName={deleting.displayName}
          domainID={domain.ID}
          folderID={folder.folderid}
          memberID={deleting.memberID}
        />}
      </ViewWrapper>
    );
  }
}

FolderDetails.contextType = CapabilityContext;
FolderDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  owners: PropTypes.array.isRequired,
  domain: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  add: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchOwners: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    owners: state.folders.Owners,
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(FolderDetails)));
