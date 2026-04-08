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
  List,
  ListItemButton,
  ListItemText,
  Tabs,
  Tab,
} from '@mui/material';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { editServerData, fetchServerDetails, fetchServerDomains, fetchServerUsers } from '../actions/servers';
import { getStringAfterLastSlash } from '../utils';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../store';
import { Server, UpdateServer } from '@/types/servers';
import { ChangeEvent } from '@/types/common';
import { UserListItem } from '@/types/users';
import { DomainListItem } from '@/types/domains';


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
  const [userList, setUserList] = useState<UserListItem[]>([]);
  const [domainList, setDomainList] = useState<DomainListItem[]>([]);
  const [tab, setTab] = useState<number>(window.location.hash ?
    (parseInt(window.location.hash.slice(1)) || 0) : 0,);
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const edit = async (server: UpdateServer) => await dispatch(editServerData(server));
  const fetch = async (id: number) => await dispatch(fetchServerDetails(id));
  const fetchUsers = async (id: number) => await dispatch(fetchServerUsers(id));
  const fetchDomains = async (id: number) => await dispatch(fetchServerDomains(id));

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

    (async () => {
      const users = await fetchUsers(parseInt(getStringAfterLastSlash()))
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      if(users?.data) setUserList(users.data);
    })();

    (async () => {
      const domains = await fetchDomains(parseInt(getStringAfterLastSlash()))
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      if(domains?.data) setDomainList(domains.data);
    })();
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

  const handleTab = (_: unknown, tab: number) => {
    location.hash = '#' + tab;
    setTab(tab);
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
        <Tabs onChange={handleTab} value={tab} sx={{ mt: 1 }}>
          <Tab label={t("Server")} />
          <Tab label={t("Domains")} />
          <Tab label={t("Users")} />
        </Tabs>
        {tab === 0 && <FormControl className={classes.form}>
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
        </FormControl>}

        {tab === 1 && <List dense>
          {domainList.map((domain: DomainListItem, idx: number) => 
            <ListItemButton
              key={idx}
              onClick={handleNavigation('domains/' + domain.ID)}
              divider
            >
              <ListItemText
                primary={domain.domainname || ''}
                secondary={domain.displayname || ''}
              />
            </ListItemButton>
          )}
        </List>}

        {tab === 2 && <List dense>
          {userList.map((user: UserListItem, idx: number) => 
            <ListItemButton
              key={idx}
              onClick={handleNavigation(user.domainID + '/users/' + user.ID)}
              divider
            >
              <ListItemText
                primary={user.username || ''}
              />
            </ListItemButton>
          )}
        </List>}
        <div style={{ marginTop: 8 }}>
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
        </div>
      </Paper>
    </ViewWrapper>
  );
}


export default ServerDetails;
