// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

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
  Button,
} from '@mui/material';
import { connect } from 'react-redux';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { editServerData, fetchServerDetails } from '../actions/servers';
import { getStringAfterLastSlash } from '../utils';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  typo: {
    margin: theme.spacing(0, 0, 2, 0),
  },
});

class ServerDetails extends PureComponent {

  state = {
    server: {},
    unsaved: false,
    autocompleteInput: '',
    loading: true,
  }

  async componentDidMount() {
    const { fetch } = this.props;
    const server = await fetch(getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      loading: false,
      server: server || {},
    });
  }

  handleInput = field => event => {
    this.setState({
      server: {
        ...this.state.server,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleEdit = () => {
    const { edit } = this.props;
    const { server } = this.state;
    edit({
      ID: server.ID,
      hostname: server.hostname,
      extname: server.extname,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  render() {
    const { classes, t } = this.props;
    const { loading, server, snackbar } = this.state;
    const { hostname, extname, domains, users } = server;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);

    return (
      <ViewWrapper
        topbarTitle={t('Servers')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
        loading={loading}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Server' })}
            </Typography>
          </Grid>
          <Typography>{domains} {t('Domains')} - {users} {t('Users')}</Typography>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Hostname")}
              onChange={this.handleInput('hostname')}
              fullWidth 
              value={hostname || ''}
              autoFocus
              required
            />
            <TextField 
              className={classes.input} 
              label={t("External name")} 
              fullWidth
              onChange={this.handleInput('extname')}
              value={extname || ''}
              variant="outlined"
            />
          </FormControl>
          <Button
            color="secondary"
            onClick={this.handleNavigation('servers')}
            style={{ marginRight: 8 }}
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleEdit}
            disabled={!writable || !hostname || !extname}
          >
            {t('Save')}
          </Button>
        </Paper>
      </ViewWrapper>
    );
  }
}

ServerDetails.contextType = CapabilityContext;
ServerDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async server => await dispatch(editServerData(server)).catch(message => Promise.reject(message)),
    fetch: async id => await dispatch(fetchServerDetails(id))
      .then(server => server)
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(ServerDetails)));
