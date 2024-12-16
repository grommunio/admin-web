// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid2,
  TextField,
  FormControl,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { connect } from 'react-redux';
import { editDomainData, fetchDomainDetails } from '../actions/domains';
import { changeDomainPassword } from '../api';
import { getStringAfterLastSlash, getPolicyDiff } from '../utils';
import { fetchOrgsData } from '../actions/orgs';
import SyncPolicies from '../components/SyncPolicies';
import { SYSTEM_ADMIN_READ, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { fetchServersData } from '../actions/servers';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';
import { AppSettingsAlt, Dns } from '@mui/icons-material';
import { useNavigate } from 'react-router';

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
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
  tabs: {
    marginTop: 16,
  },
});

const DomainListDetails = props => {
  const [state, setState] = useState({
    domainname: '',
    domainStatus: 0,
    orgID: '',
    maxUser: 0,
    title: '',
    address: '',
    adminName: '',
    tel: '',
    homeserver: '',
    syncPolicy: {},
    defaultPolicy: {},
    changingPw: false,
    newPw: '',
    checkPw: '',
    tab: 0,
    chat: false,
    loading: true,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const statuses = [
    { name: 'Activated', ID: 0 },
    { name: 'Deactivated', ID: 3 },
  ]

  useEffect(() => {
    const inner = async () => {
      const { fetch, fetchOrgs, fetchServers, capabilities } = props;

      if(capabilities.includes(SYSTEM_ADMIN_READ)) {
        await fetchServers()
          .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      }

      const domain = await fetch(getStringAfterLastSlash())
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      const defaultPolicy = domain.defaultPolicy;
      domain.syncPolicy = domain.syncPolicy || {};
      setState({
        ...state, 
        loading: false,
        ...(domain || {}),
        syncPolicy: {
          ...defaultPolicy,
          ...domain.syncPolicy,
          maxattsize: (domain.syncPolicy.maxattsize || defaultPolicy.maxattsize) / 1048576 || '',
        },
        defaultPolicy,
      });

      if(capabilities.includes(SYSTEM_ADMIN_READ)) {
        fetchOrgs()
          .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      }
    };

    inner();
  }, []);

  useEffect(() => {
    const { orgID } = state;
    const domainOrg = props.orgs.find(o => o.ID === orgID);
    setState({
      ...state, 
      orgID: domainOrg || "",
    });
  }, [props.orgs]);

  const handleInput = field => event => {
    setState({
      ...state, 
      [field]: event.target.value,
    });
  }

  const handleCheckbox = field => event => setState({
    ...state, 
    [field]: event.target.checked,
    unsaved: true,
  });

  const handleEdit = () => {
    const { ID, domainname, domainStatus, orgID, chat, homeserver,
      maxUser, title, address, adminName, tel, defaultPolicy, syncPolicy } = state;
    props.edit({
      ID,
      domainname,
      domainStatus,
      orgID: orgID ? orgID.ID : 0,
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

  const handlePasswordChange = async () => {
    const { domain, newPw } = state;
    await changeDomainPassword(domain.ID, newPw);
    setState({ ...state, changingPw: false });
  }

  const handleKeyPress = event => {
    const { newPw, checkPw } = state;
    if(event.key === 'Enter' && newPw === checkPw) handlePasswordChange();
  }

  const handleBack = () => {
    const { capabilities } = props;
    navigate(capabilities.includes(SYSTEM_ADMIN_READ) ? '/domains' : '/' + getStringAfterLastSlash());
  }

  const handleTab = (e, tab) => setState({ ...state, tab })

  const handleSyncChange = field => event => {
    const { syncPolicy } = state;
    setState({
      ...state, 
      syncPolicy: {
        ...syncPolicy,
        [field]: event.target.value,
      },
    });
  }

  const handleSyncCheckboxChange = field => (event, newVal) => {
    const { syncPolicy } = state;
    setState({
      ...state, 
      syncPolicy: {
        ...syncPolicy,
        [field]: newVal ? 1 : 0,
      },
    });
  }

  const handleSlider = field => (event, newVal) => {
    const { syncPolicy } = state;
    setState({
      ...state, 
      syncPolicy: {
        ...syncPolicy,
        [field]: newVal,
      },
    });
  }

  const handleAutocomplete = (field) => (e, newVal) => {
    setState({
      ...state, 
      [field]: newVal || '',
    });
  }

  const handleServer =(e, newVal) => {
    setState({
      ...state, 
      homeserver: newVal || '',
    });
  }

  const { classes, t, orgs, capabilities, servers } = props;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  const { domainname, domainStatus, orgID, maxUser, title, address, adminName,
    tel, syncPolicy, checkPw, newPw, changingPw, snackbar, tab, defaultPolicy,
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
            value={domainStatus || 0}
            onChange={handleInput('domainStatus')}
          >
            {statuses.map((status, key) => (
              <MenuItem key={key} value={status.ID}>
                {t(status.name)}
              </MenuItem>
            ))}
          </TextField>
          {capabilities.includes(SYSTEM_ADMIN_READ) && <MagnitudeAutocomplete
            value={orgID || ''}
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
          <MagnitudeAutocomplete
            value={homeserver || ''}
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
      <Dialog open={!!changingPw} onClose={() => setState({ ...state, changingPw: false })}>
        <DialogTitle>{t('Change password')}</DialogTitle>
        <DialogContent>
          <TextField 
            className={classes.input} 
            label={t("New password")} 
            fullWidth
            type="password"
            value={newPw}
            onChange={event => setState({ ...state, newPw: event.target.value })}
            autoFocus
            onKeyPress={handleKeyPress}
          />
          <TextField 
            className={classes.input} 
            label={t("Repeat new password")} 
            fullWidth
            type="password"
            value={checkPw}
            onChange={event => setState({ ...state, checkPw: event.target.value })}
            onKeyPress={handleKeyPress}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            onClick={() => setState({ ...state, changingPw: false })}>
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePasswordChange}
            disabled={checkPw !== newPw}
          >
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </ViewWrapper>
  );
}

DomainListDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchOrgs: PropTypes.func.isRequired,
  fetchServers: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  orgs: PropTypes.array.isRequired,
  capabilities: PropTypes.array.isRequired,
  servers: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    orgs: state.orgs.Orgs,
    capabilities: state.auth.capabilities,
    servers: state.servers.Servers,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async domain => {
      await dispatch(editDomainData(domain)).catch(message => Promise.reject(message));
    },
    fetch: async id => await dispatch(fetchDomainDetails(id))
      .then(domain => domain)
      .catch(message => Promise.reject(message)),
    fetchOrgs: async () => await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }))
      .catch(message => Promise.reject(message)),
    fetchServers: async () => await dispatch(fetchServersData({ sort: 'hostname,asc', limit: 1000000, level: 0 }))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(DomainListDetails, styles)));
