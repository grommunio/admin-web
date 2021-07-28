// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

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
  Button,
  List,
  ListItemText,
  ListItem,
  Divider,
  IconButton,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchServiceFiles, deleteDBFile, renameDBService } from '../actions/dbconf';
import TopBar from '../components/TopBar';
import { getStringAfterLastSlash } from '../utils';
import Feedback from '../components/Feedback';
import { Delete } from '@material-ui/icons';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';

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
    overflowY: 'auto',
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
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  select: {
    minWidth: 60,
  },
});

class DBService extends PureComponent {

  state = {
    files: [],
    name: '',
    unsaved: false,
    deleting: false,
  }

  async componentDidMount() {
    const { fetch } = this.props;
    const name = getStringAfterLastSlash();
    const files = await fetch(name)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      files: files?.data || [],
      name: name || '',
    });
  }

  handleInput = field => e => {
    this.setState({
      [field]: e.target.value,
    });
  }

  handleDelete = file => event => {
    event.stopPropagation();
    this.setState({ deleting: file });
  }

  handleDeleteSuccess = () => {
    const files = [...this.state.files].filter(f => f !== this.state.deleting);
    this.setState({ deleting: false, snackbar: 'Success!', files });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteError = error => this.setState({ snackbar: error });

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleEdit = () => {
    this.props.rename(getStringAfterLastSlash(), this.state.name)
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  render() {
    const { classes, t } = this.props;
    const { name, snackbar, files, deleting } = this.state;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);

    return (
      <div className={classes.root}>
        <TopBar title={t("DB Service")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('editHeadline', { item: 'Service' })}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField
                label={t("Service")} 
                className={classes.input} 
                value={name || ''}
                autoFocus
                onChange={this.handleInput('name')}
              />
            </FormControl>
            <Typography variant="h6">Files</Typography>
            <List>
              {files.map((file, idx) => <React.Fragment key={idx}>
                <ListItem button onClick={this.handleNavigation(`dbconf/${name}/${file}`)}>
                  <ListItemText
                    primary={file}
                  />
                  {writable && <IconButton onClick={this.handleDelete(file)}>
                    <Delete color="error" />
                  </IconButton>}
                </ListItem>
                <Divider />
              </React.Fragment>
              )}
            </List>
            <Button
              variant="text"
              color="secondary"
              onClick={this.handleNavigation('dbconf')}
              style={{ marginRight: 8 }}
            >
              {t('Back')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
              disabled={!writable}
            >
              {t('Save')}
            </Button>
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
          <DomainDataDelete
            open={!!deleting}
            delete={this.props.delete}
            onSuccess={this.handleDeleteSuccess}
            onError={this.handleDeleteError}
            onClose={this.handleDeleteClose}
            item={deleting}
            id={deleting}
            domainID={name}
          />
        </div>
      </div>
    );
  }
}

DBService.contextType = CapabilityContext;
DBService.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  rename: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (service) => await dispatch(fetchServiceFiles(service))
      .then(files => files)
      .catch(message => Promise.reject(message)),
    delete: async (service, file) => await dispatch(deleteDBFile(service, file))
      .catch(message => Promise.reject(message)),
    rename: async (service, file) => await dispatch(renameDBService(service, file))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DBService)));
