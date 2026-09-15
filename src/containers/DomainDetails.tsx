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
  InputLabel,
  MenuItem,
  Select,
  Button,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  Theme,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { editDomainData, editDomainPluginData, editDomainSmtpGateway, fetchDomainDetails, fetchDomainPlugins, fetchDomainSmtpGateway } from '../actions/domains';
import { getStringAfterLastSlash, getPolicyDiff } from '../utils';
import { fetchOrgsData } from '../actions/orgs';
import SyncPolicies from '../components/SyncPolicies';
import { domainStatuses, GWEB_PLUGIN_LIST, SYSTEM_ADMIN_READ, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { fetchServersData } from '../actions/servers';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';
import { AppSettingsAlt, Dns, Extension, Send } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store';
import { ChangeEvent } from '@/types/common';
import { Org } from '@/types/orgs';
import { Server } from '@/types/servers';
import { DOMAIN_STATUS, SmtpGatewayData, UpdateDomain } from '../types/domains';
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
  disabledPlugins: {
    margin: theme.spacing(1),
  }
}));

const EMPTY_SMTP_GATEWAY: SmtpGatewayData = {
  host: '',
  port: 25,
  encryption: 'none',
  username: '',
  password: '',
  passwordSet: false,
  enabled: true,
  description: '',
};

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
    unsaved: false,
  });
  const [disabledPlugins, setDisabledPlugins] = useState<string[]>([]);
  const [smtpGateway, setSmtpGateway] = useState<SmtpGatewayData>(EMPTY_SMTP_GATEWAY);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState("");
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const edit = async (domain: UpdateDomain) => await dispatch(editDomainData(domain));
  const putPlugins = async (domainID: number) => await dispatch(editDomainPluginData(domainID, disabledPlugins));
  const fetch = async (id: number) => await dispatch(fetchDomainDetails(id));
  const fetchPlugins = async (id: number) => await dispatch(fetchDomainPlugins(id));
  const fetchOrgs = async () =>
    await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }));
  const fetchServers = async () =>
    await dispatch(fetchServersData({ sort: 'hostname,asc', limit: 1000000, level: 0 }));

  // The backend stores the SMTP gateway config in the `domain_smtp_gateway`
  // MySQL table; gromox reads the same table at SMTP delivery time.
  const putSmtpGateway = async (domainID: number, gateway: SmtpGatewayData) =>
    await dispatch(editDomainSmtpGateway(domainID, gateway));
  const fetchSmtpGateway = async (domainID: number) => await dispatch(fetchDomainSmtpGateway(domainID));

  useEffect(() => {
    (async () => {
      if(capabilities.includes(SYSTEM_ADMIN_READ)) {
        await fetchServers()
          .catch(message => setSnackbar(message || 'Unknown error'));
      }

      let orgs = [];
      if(capabilities.includes(SYSTEM_ADMIN_READ)) {
        orgs = await fetchOrgs()
          .catch(message => setSnackbar(message || 'Unknown error'));
      }

      const domain = await fetch(parseInt(getStringAfterLastSlash()));
      const domainOrg = orgs.find((o: Org) => o.ID === domain.orgID);
      const defaultPolicy = domain.defaultPolicy;
      domain.syncPolicy = domain.syncPolicy || {};
      setState({
        ...state,
        org: domainOrg || null,
        ...(domain || {}),
        syncPolicy: {
          ...defaultPolicy,
          ...domain.syncPolicy,
          maxattsize: (domain.syncPolicy.maxattsize || defaultPolicy.maxattsize) / 1048576 || '',
        },
        defaultPolicy,
      });

      setLoading(false);
    })();
  }, []);

  const handleInput = (field: string) => (event: ChangeEvent) => {
    setState({
      ...state,
      [field]: event.target.value,
    });
  }

  const updateSmtp = <K extends keyof SmtpGatewayData>(field: K, value: SmtpGatewayData[K]) =>
    setSmtpGateway(gw => ({
      ...gw,
      [field]: value,
    }));

  const handleCheckbox = (field: string) => (event: ChangeEvent) => setState({
    ...state, 
    [field]: event.target.checked,
    unsaved: true,
  });

  const handleEdit = () => {
    const { ID, domainname, domainStatus, org, chat, homeserver,
      maxUser, title, address, adminName, tel, defaultPolicy, syncPolicy } = state;

    // Save plugins
    if(tab === 2) {
      putPlugins(ID)
        .then(() => setSnackbar('Success!'))
        .catch(message => setSnackbar(message || 'Unknown error'));
      return;
    }

    // Save smtp gateway
    if(tab === 3) {
      // Don't send the password back unless it was edited.
      const payload: any = { ...smtpGateway };
      if(!smtpGateway.password)
        delete payload.password;
      putSmtpGateway(ID, payload)
        .then(() => setSnackbar('Success!'))
        .catch(message => setSnackbar(message || 'Unknown error'));
      return;
    }

    // Save domain
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
      .then(() => setSnackbar('Success!'))
      .catch(message => setSnackbar(message || 'Unknown error'));
  }

  const handleBack = () => {
    navigate(-1);
  }

  const handleTab = (_: unknown, tab: number) => {
    setState({ ...state, tab });

    // Plugins tab
    if(tab === 2) {
      (async () => {
        setLoading(true);
        const plugins = await fetchPlugins(parseInt(getStringAfterLastSlash()))
          .catch(message => setSnackbar(message || 'Unknown error'));
        if(plugins?.data) {
          setDisabledPlugins(plugins.data || [])
        }
        setLoading(false);
      })();
    }

    // SMTP gateway tab
    if(tab === 3) {
      (async () => {
        setLoading(true);
        const gw = await fetchSmtpGateway(parseInt(getStringAfterLastSlash()))
          .catch(message => setSnackbar(message || 'Unknown error'));
        setSmtpGateway(gw?.data ? { ...EMPTY_SMTP_GATEWAY, ...gw.data } : EMPTY_SMTP_GATEWAY);
        setLoading(false);
      })();
    }
  }

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

  const handlePlugin = (plugin: string) => () => {
    const currentIndex = disabledPlugins.indexOf(plugin);
    const newChecked = [...disabledPlugins];

    if (currentIndex === -1) {
      newChecked.push(plugin);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setDisabledPlugins(newChecked);
  };

  const handleMaxUser = (event: ChangeEvent) => {
    const input: string = event.target.value;
    if(input === "") {
      setState({
        ...state,
        maxUser: "",
      });
    }
    if(input && input.match("^\\d*?$")) {
      setState({
        ...state,
        maxUser: input,
      });
    }
  }

  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  const { domainname, org, domainStatus, maxUser, title, address, adminName,
    tel, syncPolicy, tab, defaultPolicy,
    chat, homeserver } = state;

  return (
    <ViewWrapper
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar("")}
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
          <Tab label={t("Disabled plugins")} sx={{ minHeight: 48 }} iconPosition='start' icon={<Extension />}/>
          <Tab label={t("SMTP gateway")} sx={{ minHeight: 48 }} iconPosition='start' icon={<Send />}/>
        </Tabs>
        {tab === 3 && <div className={classes.form}>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
            {t("Route outgoing mail from this domain through a specific SMTP server. "
              + "Leave empty to use the global default.")}
          </Typography>
          <TextField
            fullWidth
            className={classes.input}
            label={t("Host")}
            value={smtpGateway.host}
            onChange={e => updateSmtp('host', e.target.value)}
            placeholder="smtp.example.com"
            required
          />
          <TextField
            fullWidth
            type="number"
            className={classes.input}
            label={t("Port")}
            value={smtpGateway.port}
            onChange={e => updateSmtp('port', Number(e.target.value) || 25)}
          />
          <FormControl fullWidth className={classes.input}>
            <InputLabel id="smtp-encryption-label">{t("Encryption")}</InputLabel>
            <Select
              labelId="smtp-encryption-label"
              label={t("Encryption")}
              value={smtpGateway.encryption}
              onChange={e => updateSmtp('encryption', e.target.value as SmtpGatewayData['encryption'])}
            >
              <MenuItem value="none">{t("None (plain SMTP)")}</MenuItem>
              <MenuItem value="starttls">{t("STARTTLS (verify certificate)")}</MenuItem>
              <MenuItem value="starttls_unverified">{t("STARTTLS (do not verify certificate)")}</MenuItem>
              <MenuItem value="tls">{t("TLS (implicit, port 465)")}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            className={classes.input}
            label={t("Username")}
            value={smtpGateway.username}
            onChange={e => updateSmtp('username', e.target.value)}
            autoComplete="off"
          />
          <TextField
            fullWidth
            type="password"
            className={classes.input}
            label={t("Password") + (smtpGateway.passwordSet ? ` (${t("set — leave empty to keep")})` : '')}
            value={smtpGateway.password}
            onChange={e => updateSmtp('password', e.target.value)}
            autoComplete="new-password"
          />
          <TextField
            fullWidth
            className={classes.input}
            label={t("Description")}
            value={smtpGateway.description}
            onChange={e => updateSmtp('description', e.target.value)}
          />
        </div>}
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
            onChange={handleAutocomplete('org')}
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
            onChange={handleMaxUser}
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
        {tab === 2 &&
          <div className={classes.disabledPlugins}>
            <Typography variant='h6'>
              {t("List of disabled plugins in grommunio-web")}
            </Typography>
            <List>
              {GWEB_PLUGIN_LIST.map(plugin =>
                <ListItem
                  key={plugin}
                  disablePadding
                >
                  <ListItemButton
                    role={undefined}
                    onClick={handlePlugin(plugin)} dense
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={disabledPlugins.includes(plugin)}
                        tabIndex={-1}
                        disableRipple
                        slotProps={{ input: { 'aria-labelledby': plugin } }}
                      />
                    </ListItemIcon>
                    <ListItemText id={plugin} primary={plugin} />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          </div>
        }
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
