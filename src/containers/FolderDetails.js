// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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
} from '@material-ui/core';
import Add from '@material-ui/icons/AddCircleOutline';
import Delete from '@material-ui/icons/Delete';
import { connect } from 'react-redux';
import TopBar from '../components/TopBar';
import { fetchFolderDetails, addFolderData, fetchOwnersData, deleteOwnerData } from '../actions/folders';
import AddOwner from '../components/Dialogs/AddOwner';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    padding: theme.spacing(2, 2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  toolbar: theme.mixins.toolbar,
  grid: {
    display: 'flex',
    alignItems: 'center',
  },
});

class FolderDetails extends PureComponent {

  state = {
    folder: {},
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
    const folder = await fetch(splits[1], splits[3]);
    this.setState({ folder });
    fetchOwners(splits[1], folder.folderid);
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

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => {
    const { fetchOwners, domain } = this.props;
    this.setState({ adding: false });
    fetchOwners(domain.ID, this.state.folder.folderid)
      .catch(error => this.setState({ snackbar: error }));
  }

  handleAddingError = error => this.setState({ snackbar: error });

  handleDelete = folder => () => {
    this.setState({ deleting: folder });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => {
    const { fetchOwners, domain } = this.props;
    this.setState({ deleting: false, snackbar: 'Success!' });
    fetchOwners(domain.ID, this.state.folder.folderid)
      .catch(error => this.setState({ snackbar: error }));
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  render() {
    const { classes, t, domain, owners } = this.props;
    const { folder, adding, deleting } = this.state;

    return (
      <div className={classes.root}>
        <TopBar title="Folders"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
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
                onChange={this.handleInput('displayname')}
                autoFocus
                disabled
              />
              <TextField
                select
                className={classes.input}
                label={t("Container")}
                fullWidth
                value={folder.container || 'IPF.Note'}
                onChange={this.handleInput('container')}
                disabled
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
                rows={4}
                value={folder.comment || ''}
                onChange={this.handleInput('comment')}
                disabled
              />
            </FormControl>
            <Grid container className={classes.grid}>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('Owners')}
              </Typography>
              <IconButton onClick={this.handleAdd}>
                <Add fontSize="small" color="primary" />
              </IconButton>
            </Grid>
            <List dense>
              {owners.map(owner => <React.Fragment key={owner.memberID}>
                <ListItem>
                  <ListItemText primary={owner.displayName} />
                  <IconButton onClick={this.handleDelete(owner)}>
                    <Delete fontSize="small" color="error"/>
                  </IconButton>
                </ListItem>
                <Divider />
              </React.Fragment>
              )}
            </List>
            <Button
              variant="text"
              color="primary"
              onClick={this.props.history.goBack}
              style={{ marginRight: 8 }}
            >
              {t('Back')}
            </Button>
          </Paper>
        </div>
        {folder.folderid && <AddOwner
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          domain={domain}
          folderID={folder.folderid}
        />}
        {folder.folderid && <DomainDataDelete
          open={!!deleting}
          delete={() => this.props.delete(domain.ID, folder.folderid, deleting.memberID)}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={deleting.displayName}
          id={deleting.memberID}
          domainID={domain.ID}
        />}
      </div>
    );
  }
}

FolderDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  owners: PropTypes.array.isRequired,
  domain: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  add: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
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
    add: async (domainID, folder) => {
      await dispatch(addFolderData(domainID, folder)).catch(msg => Promise.reject(msg));
    },
    fetchOwners: async (domainID, folderID) => {
      await dispatch(fetchOwnersData(domainID, folderID, { limit: '' })).catch(msg => Promise.reject(msg));
    },
    delete: async (domainID, folderID, memberID) => {
      await dispatch(deleteOwnerData(domainID, folderID, memberID)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(FolderDetails)));
