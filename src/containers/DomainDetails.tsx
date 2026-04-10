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
  MenuItem,
  Button,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  Theme,
} from '@mui/material';
import { editDomainData, fetchDomainDetails } from '../actions/domains';
import { getStringAfterLastSlash, getPolicyDiff } from '../utils';
import { fetchOrgsData } from '../actions/orgs';
import SyncPolicies from '../components/SyncPolicies';
import { domainStatuses, SYSTEM_ADMIN_READ, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { fetchServersData } from '../actions/servers';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';
import { AppSettingsAlt, Dns } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store';
import { ChangeEvent } from '@/types/common';
import { Org } from '@/types/orgs';
import { Server } from '@/types/servers';
import { DOMAIN_STATUS, UpdateDomain } from '../types/domains';
import { SyncPolicy } from '@/types/sync';


const useStyles = makeStyles()((theme: Theme) => ({
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
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
  tabs: {
    marginTop: 16,
  },
}));

type DomainDetailsState = {
  ID: number;
  domainname: string;
  domainStatus: number;
  org: Org | null;
  unsaved: boolean;
  maxUser: string;
  title: string;
  address: string;
  adminName: string;
  tel: string;
  homeserver: Server | null,
  syncPolicy: Partial<SyncPolicy>,
  defaultPolicy: Partial<SyncPolicy>,
  changingPw: false,
  newPw: string;
  checkPw: string;
  tab: number,
  chat: boolean;
  loading: boolean;
  snackbar: string;
}

const DomainDetails = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const orgs = useAppSelector(state => state.orgs.Orgs);
  const capabilities = useAppSelector(state => state.auth.capabilities);
  const servers = useAppSelector(state => state.servers.Servers);
  const [state, setState] = useState<DomainDetailsState>({
    ID: 0,
    domainname: '',
    domainStatus: DOMAIN_STATUS.ACTIVATED,
    org: null,
    maxUser: "",
    title: '',
    address: '',
    adminName: '',
    tel: '',
    homeserver: null,
    syncPolicy: {},
    defaultPolicy: {},
    changingPw: false,
    newPw: '',
    checkPw: '',
    tab: 0,
    chat: false,
    loading: true,
    snackbar: "",
    unsaved: false,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const edit = async (domain: UpdateDomain) => await dispatch(editDomainData(domain));
  const fetch = async (id: number) => await dispatch(fetchDomainDetails(id));
  const fetchOrgs = async () =>
    await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }));
  const fetchServers = async () =>
    await dispatch(fetchServersData({ sort: 'hostname,asc', limit: 1000000, level: 0 }));

  useEffect(() => {
    const inner = async () => {
      if(capabilities.includes(SYSTEM_ADMIN_READ)) {
        await fetchServers()
          .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      }

      let orgs = [];
      if(capabilities.includes(SYSTEM_ADMIN_READ)) {
        orgs = await fetchOrgs()
          .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      }

      const domain = await fetch(parseInt(getStringAfterLastSlash()));
      const domainOrg = orgs.find((o: Org) => o.ID === domain.orgID);
      const defaultPolicy = domain.defaultPolicy;
      domain.syncPolicy = domain.syncPolicy || {};
      setState({
        ...state,
        org: domainOrg || null,
        loading: false,
        ...(domain || {}),
        syncPolicy: {
          ...defaultPolicy,
          ...domain.syncPolicy,
          maxattsize: (domain.syncPolicy.maxattsize || defaultPolicy.maxattsize) / 1048576 || '',
        },
        defaultPolicy,
      });
    };

    inner();
  }, []);

  const handleInput = (field: string) => (event: ChangeEvent) => {
    setState({
      ...state, 
      [field]: event.target.value,
    });
  }

  const handleCheckbox = (field: string) => (event: ChangeEvent) => setState({
    ...state, 
    [field]: event.target.checked,
    unsaved: true,
  });

  const handleEdit = () => {
    const { ID, domainname, domainStatus, org, chat, homeserver,
      maxUser, title, address, adminName, tel, defaultPolicy, syncPolicy } = state;
    edit({
      ID,
      domainname,
      domainStatus,
      orgID: org ? org.ID : 0,
      maxUser: parseInt(maxUser) || null,
      title,
      address,
      adminName,
      tel,
      homeserver: homeserver?.ID || null,
      syncPolicy: getPolicyDiff(defaultPolicy, syncPolicy),
      chat,
    })
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const handleBack = () => {
    navigate(-1);
  }

  const handleTab = (_: unknown, tab: number) => setState({ ...state, tab })

  const handleSyncChange = (field: string) => (event: ChangeEvent) => {
    const { syncPolicy } = state;
    setState({
      ...state, 
      syncPolicy: {
        ...syncPolicy,
        [field]: event.target.value,
      },
    });
  }

  const handleSyncCheckboxChange = (field: string) => (_: unknown, newVal: boolean) => {
    const { syncPolicy } = state;
    setState({
      ...state, 
      syncPolicy: {
        ...syncPolicy,
        [field]: newVal ? 1 : 0,
      },
    });
  }

  const handleSlider = (field: string) => (_: unknown, newVal: number | number[]) => {
    const { syncPolicy } = state;
    setState({
      ...state, 
      syncPolicy: {
        ...syncPolicy,
        [field]: newVal,
      },
    });
  }

  const handleAutocomplete = (field: string) => (_: unknown, newVal: Org) => {
    setState({
      ...state, 
      [field]: newVal || '',
    });
  }

  const handleServer =(_: unknown, newVal: Server) => {
    setState({
      ...state, 
      homeserver: newVal || '',
    });
  }

  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  const { domainname, org, domainStatus, maxUser, title, address, adminName,
    tel, syncPolicy, snackbar, tab, defaultPolicy,
    chat, homeserver, loading } = state;

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
            {t('editHeadline', { item: 'Domain' })}
          </Typography>
        </Grid2>
        <Tabs className={classes.tabs} indicatorColor="primary" onChange={handleTab} value={tab}>
          <Tab label={t("Domain")} sx={{ minHeight: 48 }} iconPosition='start' icon={<Dns />}/>
          <Tab label={t("Sync policy")} sx={{ minHeight: 48 }} iconPosition='start' icon={<AppSettingsAlt />}/>
        </Tabs>
        {tab === 0 && <FormControl className={classes.form}>
          <Grid2 container className={classes.input}>
            <TextField
              label={t("Domain")} 
              style={{ flex: 1, marginRight: 8 }} 
              value={domainname || ''}
              autoFocus
              disabled
            />
          </Grid2>
          <TextField
            select
            className={classes.input}
            label={t("Status")}
            fullWidth
            value={domainStatus}
            onChange={handleInput('domainStatus')}
          >
            {domainStatuses.map((status, key) => (
              <MenuItem key={key} value={status.ID}>
                {t(status.name)}
              </MenuItem>
            ))}
          </TextField>
          {capabilities.includes(SYSTEM_ADMIN_READ) && <MagnitudeAutocomplete<Org>
            value={org}
            filterAttribute={'name'}
            onChange={handleAutocomplete('orgID')}
            className={classes.input} 
            options={orgs}
            label={t('Organization')}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
          />}
          <TextField 
            className={classes.input} 
            label={t("Maximum users")} 
            fullWidth 
            value={maxUser || ''}
            onChange={handleInput('maxUser')}
          />
          <TextField 
            className={classes.input} 
            label={t("Title")} 
            fullWidth 
            value={title || ''}
            onChange={handleInput('title')}
          />
          <TextField 
            className={classes.input} 
            label={t("Address")} 
            fullWidth 
            value={address || ''}
            onChange={handleInput('address')}
          />
          <TextField 
            className={classes.input} 
            label={t("Administrator")} 
            fullWidth 
            value={adminName || ''}
            onChange={handleInput('adminName')}
          />
          <TextField 
            className={classes.input} 
            label={t("Telephone")} 
            fullWidth 
            value={tel || ''}
            onChange={handleInput('tel')}
          />
          <MagnitudeAutocomplete<Server>
            value={homeserver}
            filterAttribute={'hostname'}
            onChange={handleServer}
            className={classes.input} 
            options={servers}
            label={t('Homeserver')}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={chat || false}
                onChange={handleCheckbox('chat')}
                color="primary"
              />
            }
            className={classes.input} 
            label={t('grommunio-chat Team')}
          />
        </FormControl>}
        {tab === 1 && <SyncPolicies
          syncPolicy={syncPolicy}
          defaultPolicy={defaultPolicy}
          handleChange={handleSyncChange}
          handleCheckbox={handleSyncCheckboxChange}
          handleSlider={handleSlider}
        />}
        <Button
          color="secondary"
          onClick={handleBack}
          style={{ marginRight: 8 }}
        >
          {t('Back')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEdit}
          disabled={!writable}
        >
          {t('Save')}
        </Button>
      </Paper>
    </ViewWrapper>
  );
}


export default DomainDetails;
