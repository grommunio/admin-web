// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid2,
  TextField,
  FormControl,
  Button,
  Theme,
} from '@mui/material';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { editServerData, fetchServerDetails } from '../actions/servers';
import { getStringAfterLastSlash } from '../utils';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../store';
import { Server, UpdateServer } from '@/types/servers';
import { ChangeEvent } from '@/types/common';


const useStyles = makeStyles()((theme: Theme) => ({
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
}));

const ServerDetails = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    server: {
      ID: 0,
      hostname: "",
      extname: "",
      domains: 0,
      users: 0,
    } as Server,
    unsaved: false,
    loading: true,
    snackbar: "",
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const edit = async (server: UpdateServer) => await dispatch(editServerData(server));
  const fetch = async (id: number) => await dispatch(fetchServerDetails(id));

  useEffect(() => {
    const inner = async () => {
      const server = await fetch(parseInt(getStringAfterLastSlash()))
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      setState({
        ...state, 
        loading: false,
        server: server || {},
      });
    };

    inner();
  }, []);

  const handleInput = (field: keyof UpdateServer) => (event: ChangeEvent) => {
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
    const { server } = state;
    edit({
      ID: server.ID,
      hostname: server.hostname,
      extname: server.extname,
    })
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const handleNavigation = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(`/${path}`);
  }

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
        <Grid2 container>
          <Typography
            color="primary"
            variant="h5"
          >
            {t('editHeadline', { item: 'Server' })}
          </Typography>
        </Grid2>
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


export default ServerDetails;
