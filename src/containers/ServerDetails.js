// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
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
import { useNavigate } from 'react-router';

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

const ServerDetails = props => {
  const [state, setState] = useState({
    server: {},
    unsaved: false,
    loading: true,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  useEffect(() => {
    const inner = async () => {
      const { fetch } = props;
      const server = await fetch(getStringAfterLastSlash())
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      setState({
        ...state, 
        loading: false,
        server: server || {},
      });
    };

    inner();
  }, []);

  const handleInput = field => event => {
    setState({
      ...state, 
      server: {
        ...state.server,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  const handleEdit = () => {
    const { edit } = props;
    const { server } = state;
    edit({
      ID: server.ID,
      hostname: server.hostname,
      extname: server.extname,
    })
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const handleNavigation = path => event => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const { classes, t } = props;
  const { loading, server, snackbar } = state;
  const { hostname, extname, domains, users } = server;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);

  return (
    <ViewWrapper
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
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
            onChange={handleInput('hostname')}
            fullWidth 
            value={hostname || ''}
            autoFocus
            required
          />
          <TextField 
            className={classes.input} 
            label={t("External name")} 
            fullWidth
            onChange={handleInput('extname')}
            value={extname || ''}
            variant="outlined"
          />
        </FormControl>
        <Button
          color="secondary"
          onClick={handleNavigation('servers')}
          style={{ marginRight: 8 }}
        >
          {t('Back')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEdit}
          disabled={!writable || !hostname || !extname}
        >
          {t('Save')}
        </Button>
      </Paper>
    </ViewWrapper>
  );
}

ServerDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
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
  withTranslation()(withStyles(ServerDetails, styles)));
