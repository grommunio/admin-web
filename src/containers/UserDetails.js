// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid2,
  Button,
  Tooltip,
} from '@mui/material';
import { connect } from 'react-redux';
import { fetchUserData, editUserData, editUserRoles, fetchLdapDump, getStoreLangs} from '../actions/users';
import { fetchRolesData } from '../actions/roles';
import Sync from '@mui/icons-material/Sync';
import Detach from '@mui/icons-material/SyncDisabled';
import Dump from '@mui/icons-material/Receipt';
import { syncLdapData } from '../actions/ldap';
import DetachDialog from '../components/Dialogs/DetachDialog';
import DumpDialog from '../components/Dialogs/DumpDialog';
import Account from '../components/user/Account';
import User from '../components/user/User';
import Contact from '../components/user/Contact';
import Roles from '../components/user/Roles';
import Smtp from '../components/user/Smtp';
import SyncTab from '../components/user/Sync';
import ChangeUserPassword from '../components/Dialogs/ChangeUserPassword';
import FetchMail from '../components/user/FetchMail';
import AddFetchmail from '../components/Dialogs/AddFetchmail';
import EditFetchmail from '../components/Dialogs/EditFetchmail';
import { getPolicyDiff } from '../utils';
import SyncPolicies from '../components/SyncPolicies';
import Delegates from '../components/user/Delegates';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE, SYSTEM_ADMIN_READ, USER_STATUS } from '../constants';
import ViewWrapper from '../components/ViewWrapper';
import { fetchDomainDetails } from '../actions/domains';
import { checkFormat } from '../api';
import { fetchServersData } from '../actions/servers';
import Oof from '../components/user/Oof';
import Tabs from '../components/user/Tabs';
import Altnames from '../components/user/Altnames';
import { useNavigate } from 'react-router';
import { throttle } from 'lodash';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  syncButtons: {
    margin: theme.spacing(2, 0, 2, 0),
  },
  leftIcon: {
    marginRight: 4,
  },
  header: {
    marginBottom: 16,
  },
  buttonGrid: {
    margin: theme.spacing(1, 0, 0, 1),
  },
  tabsContainer: {
    flex: 1,
  },
});

/**
 * This is by far the biggest component in the app, tread with caution
 */
const UserDetails = props => {
  const [state, setState] = useState({
    adding: false,
    editing: null,
    user: {
      altnames: [],
      fetchmail: [],
      forward: {},
      roles: [],
      properties: {},
      aliases: [],
      status: USER_STATUS.NORMAL,
    },
    syncPolicy: {},
    defaultPolicy: {},
    rawData: {},
    dump: '',
    changingPw: false,
    snackbar: '',
    tab: window.location.hash ?
      (parseInt(window.location.hash.slice(1)) || 0) : 0,
    sizeUnits: {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    },
    detaching: false,
    detachLoading: false,
    loading: true,
  });
  const [langs, setLangs] = useState([]);
  const [domainDetails, setDomainDetails] = useState({});
  const [forwardError, setForwardError] = useState(false);
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  useEffect(() => {
    const inner = async () => {
      const { fetch, fetchRoles, fetchDomainDetails, domain, storeLangs, fetchServers } = props;
      const splits = window.location.pathname.split('/');
      const user = await fetch(splits[1], splits[3])
        .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
      const defaultPolicy = user.defaultPolicy || {};
      user.syncPolicy = user.syncPolicy || {};
      setState({ ...state, ...getStateOverwrite(user, defaultPolicy), loading: false });
      const langs = await storeLangs()
        .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
      if(langs) setLangs(langs);
      // If Sys admin read-only permissions
      if(context.includes(SYSTEM_ADMIN_READ)) {
        fetchRoles()
          .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
        fetchServers()
          .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
      }
      const domainDetails = await fetchDomainDetails(domain.ID);
      if(domainDetails) setDomainDetails(domainDetails);
    };

    inner();
  }, []);

  // Transformes backend json object to useable component state object
  const getStateOverwrite = (user, defaultPolicy) => {
    if(!user) return {};
    const properties = {
      ...user.properties,
    };
    
    // Ignore domain part of username (which is an email)
    const username = user.username.slice(0, user.username.indexOf('@'));

    // Only role IDs are important
    const roles = (user.roles && user.roles.map(role => role.ID)) || [];

    /* Calculate sizeUnits (MiB, GiB, TiB) based on KiB value for every quota 
      The idea behind this loop is to find the highest devisor of the KiB value (1024^x)
      If the KiB value (quotaLimit) is divisible by, for exampe, 1024 but not by 1024^2, the sizeUnit must be MiB.
    */    
    let sizeUnits = {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    };
    for(let quotaLimit in sizeUnits) {
      if(properties[quotaLimit] === undefined) continue;
      properties[quotaLimit] = properties[quotaLimit] / 1024;
      for(let i = 2; i >= 0; i--) {
        if(properties[quotaLimit] === 0) break;
        let r = properties[quotaLimit] % 1024 ** i;
        if(r === 0) {
          sizeUnits[quotaLimit] = i + 1;
          properties[quotaLimit] = properties[quotaLimit] / 1024 ** i;
          break;
        }
      }
      properties[quotaLimit] = Math.ceil(properties[quotaLimit]);
    }

    return {
      sizeUnits,
      rawData: user,
      user: {
        ...user,
        username,
        roles,
        properties,
        syncPolicy: undefined,
        defaultPolicy: undefined,
      },
      syncPolicy: {
        ...defaultPolicy,
        ...user.syncPolicy,
        maxattsize: (user.syncPolicy.maxattsize || defaultPolicy.maxattsize) / 1048576 || '',
      },
      defaultPolicy,
    };
  }

  const handleInput = field => event => {
    setState({
      ...state, 
      user: {
        ...state.user,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  const handleForwardInput = field => e => {
    const { user } = state;
    setState({
      ...state, 
      user: {
        ...user,
        forward: {
          ...user.forward,
          [field]: e.target.value,
        },
      },
      unsaved: true,
    });

    // Check if mail is formatted correctly
    if(field === 'destination') {
      const mail = e.target.value;
      debounceFetch(mail ? { email: encodeURIComponent(mail) } : null);
    }
  }

  // When sanitizing user input, only check every 200ms
  const debounceFetch = useCallback(throttle(async params => {
    if(!params) {
      setForwardError(false);
    } else {
      const resp = await checkFormat(params)
        .catch();
      if(resp) setForwardError(!!resp.email);
    }
  }, 500), []);

  const handleStatusInput = async event => {
    const { user } = state;
    const { value } = event.target;
    const { edit, domain } = props;
    // Immediately write user status to DB
    await edit(domain.ID, {
      ID: user.ID,
      status: value,
    }).then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
    setState({
      ...state, 
      user: {
        ...user,
        status: value,
      },
      unsaved: true,
      changingPw: value === 0 && user.status === USER_STATUS.SHARED && !user.ldapID,
    });
  }

  const handlePropertyChange = field => event => {
    const { user } = state;
    setState({
      ...state, 
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: event.target.value,
        },
      },
      unsaved: true,
    });
  }

  const handlePropertyCheckbox = field => event => {
    const { user } = state;
    setState({
      ...state, 
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: event.target.checked,
        },
      },
      unsaved: true,
    });
  }

  const handleIntPropertyChange = field => event => {
    const { user } = state;
    const value = event.target.value;
    const int = parseInt(value);
    if(!isNaN(int) || value === '') {
      setState({
        ...state, 
        user: {
          ...user,
          properties: {
            ...user.properties,
            [field]: int || value,
          },
        },
        unsaved: true,
      });
    }
  }

  /**
   * Handles saving the user
   * Before sending the user state object to the backend it needs to be transformed according to the API spec
   */
  const handleEdit = () => {
    const { edit, domain } = props;
    const { user, sizeUnits, defaultPolicy, syncPolicy } = state;
    const { username, aliases, fetchmail, forward, properties, homeserver, altnames } = user;
    const { storagequotalimit, prohibitreceivequota, prohibitsendquota } = properties;

    // Convert quota (MiB, GiB or TiB) into KiB
    const storePayload = {
      messagesizeextended: undefined, // MSE is read-only
      storagequotalimit: [null, undefined, ""].includes(storagequotalimit) ? null : storagequotalimit * 2 ** (10 * sizeUnits.storagequotalimit),
      prohibitreceivequota: [null, undefined, ""].includes(prohibitreceivequota) ? null : prohibitreceivequota * 2
        ** (10 * sizeUnits.prohibitreceivequota),
      prohibitsendquota: [null, undefined, ""].includes(prohibitsendquota) ? null : prohibitsendquota * 2 ** (10 * sizeUnits.prohibitsendquota),
    };

    edit(domain.ID, {
      ...user,
      username: username + "@" + domain.domainname, // Add domain to username (username is an email)
      domainID: undefined,
      homeserver: homeserver?.ID || null,
      aliases: aliases.filter(alias => alias !== ''), // Filter empty aliases
      fetchmail: fetchmail.map(e => ({ // Transform fetchmail objects
        ...e,
        date: undefined,
        sslFingerprint: e.sslFingerprint ? e.sslFingerprint.toUpperCase() : undefined,
      })),
      properties: {
        ...properties,
        ...storePayload
      },
      syncPolicy: getPolicyDiff(defaultPolicy, syncPolicy), // Merge sync policies
      forward: forward?.forwardType !== undefined && forward.destination ? forward : null,
      altnames: altnames.map(({ altname }) => ({ altname })),
      roles: undefined,
      ldapID: undefined,
    }).then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
  }

  const handleSync = () => {
    const { sync, domain } = props;
    const { user } = state;
    sync(domain.ID, user.ID)
      .then(user => {
        const defaultPolicy = user.defaultPolicy || {};
        user.syncPolicy = user.syncPolicy || {};
        setState({
          ...state, 
          ...getStateOverwrite(user, defaultPolicy), // New backend user object received -> convert to state objects
          snackbar: 'Success!',
        });
      }).catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
  }

  const handleDump = () => {
    const { dump, domain } = props;
    const { ldapID } = state.user;
    dump({ ID: ldapID, organization: domain.orgID || 0 })
      .then(data => setState({ ...state, dump: data.data }))
      .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
  }

  const handleSaveRoles = () => {
    const { editUserRoles, domain } = props;
    const { ID, roles } = state.user;
    editUserRoles(domain.ID, ID, { roles: roles })
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
  }

  const handleTabChange = (_, tab) => {
    location.hash = '#' + tab;
    setState({ ...state, tab });
  }

  const handleAliasEdit = idx => event => {
    const { user } = state;
    const copy = [...user.aliases];
    copy[idx] = event.target.value;
    setState({ ...state, user: { ...user, aliases: copy } });
  }

  const handleAddAlias = () => {
    const { user } = state;
    const copy = [...user.aliases];
    copy.push('');
    setState({ ...state, user: { ...user, aliases: copy } });
  }

  const handleRemoveAlias = idx => () => {
    const { user } = state;
    const copy = [...user.aliases];
    copy.splice(idx, 1);
    setState({ ...state, user: { ...user, aliases: copy } });
  }

  const handleCheckbox = field => e => {
    const { pop3_imap, privDav } = state.user;
    const { checked } = e.target;
    
    if(field === "privArchive") {
      setState({
        ...state, 
        user: {
          ...state.user,
          // If archive is allowed, pop3 must be enabled
          "pop3_imap": checked || pop3_imap,
          [field]: checked,
        },
      });
    } else if(field === "privFiles") {
      setState({
        ...state, 
        user: {
          ...state.user,
          // Files uses DAV for auth, activate it as well
          "privDav": checked || privDav,
          [field]: checked,
        },
      });
    } else {
      setState({
        ...state, 
        user: {
          ...state.user,
          [field]: checked,
        },
      });
    }
  }

  const handleUnitChange = unit => event => setState({
    ...state, 
    sizeUnits: {
      ...state.sizeUnits,
      [unit]: event.target.value,
    },
  });

  const handleDetachDialog = detaching => () => setState({ ...state, detaching });
  
  const handleDetach = () => {
    const { user } = state;
    const { domain, edit } = props;
    setState({ ...state, detachLoading: true });
    edit(domain.ID, { ID: user.ID, ldapID: null })
      .then(() => setState({
        ...state, 
        user: {
          ...user,
          ldapID: null, // User detached from LDAP -> Remove LDAP ID
        },
        snackbar: 'Success!',
        detachLoading: false,
        detaching: false,
      }))
      .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error', detachLoading: false }));
  }

  const handleCloseDump = () => setState({ ...state, dump: '' });

  const handlePasswordDialogToggle = changingPw => () => setState({ ...state, changingPw });

  const handleSuccess = () => setState({ ...state, snackbar: 'Success!' });

  const handleError = msg => setState({ ...state, snackbar: msg.message || 'Unknown error' });

  const handleAutocomplete = (field) => (e, newVal) => {
    setState({
      ...state, 
      user: {
        ...state.user,
        [field]: newVal.map(r => r.ID ? r.ID : r),
      },
      unsaved: true,
    });
  }

  const handleFetchmailDialog = open => () => setState({ ...state, adding: open })

  const handleFetchmailEditDialog = open => () => setState({ ...state, editing: open })

  const addFetchmail = entry => {
    const { user } = state;
    const fetchmail = [...user.fetchmail];
    fetchmail.push(entry);
    setState({
      ...state, 
      user: {
        ...user,
        fetchmail,
      },
      adding: false,
    });
  }

  const editFetchmail = entry => {
    const { user, editing } = state;
    const fetchmail = [...user.fetchmail];
    fetchmail[editing] = entry;
    setState({
      ...state, 
      user: {
        ...user,
        fetchmail,
      },
      editing: null,
    });
  }

  const handleFetchmailDelete = idx => e => {
    const { user } = state;
    const fetchmail = [...user.fetchmail];
    e.stopPropagation();
    fetchmail.splice(idx, 1);
    setState({
      ...state, 
      user: {
        ...user,
        fetchmail,
      },
    });
  }

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

  const handleChatUser = e => {
    const { checked } = e.target;
    const { user } = state;
    setState({
      ...state, 
      user: {
        ...user,
        chat: checked,
        chatAdmin: false,
        privChat: checked ? user.privChat : false,
      },
    });
  }

  const handleServer =(e, newVal) => {
    setState({
      ...state, 
      user: {
        ...state.user,
        homeserver: newVal || '',
      },
    });
  }

  /**
   * This method is a bit obfuscated. MUI multiselects only work with arrays.
   * However, the property `attributehidden_gromox` uses a bitmask. To merge these functionalities,
   * the array of selected values is reduced to a bitmask by bitwise-OR-ing the elements.
   * The properties state always holds this bitmask.
   * The MUI component's state expands this bitmask into 3 explicitly defined array elements, that match the bits.
   * For example, `attributehidden_gromox === 3` results in `[1, 2, 0]` for the component.
   */
  const handleMultiselectChange = field => event => {
    const { user } = state;
    const { value } = event.target;
    const mask = (value || []).reduce((prev, next) => prev | next, 0)  // bitwise OR array elements
    setState({
      ...state, 
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: mask,
        },
      },
      unsaved: true,
    });
  }

  const handleAltnameEdit = (action, idx=0) => e => {
    const altnames = [...state.user.altnames]
    switch(action) {
    case "add": {
      altnames.push({ altname: "", magic: 0 });
      break;
    }
    case "edit": {
      altnames[idx].altname = e.target.value;
      break;
    }
    case "delete": {
      altnames.splice(idx, 1);
    }
    }
    setState({
      ...state, 
      user: {
        ...state.user,
        altnames: altnames,
      }
    })
  }

  const { classes, t, domain } = props;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  const sysAdminReadPermissions = context.includes(SYSTEM_ADMIN_READ);
  const { loading, user, changingPw, snackbar, tab, sizeUnits, detachLoading, defaultPolicy,
    detaching, adding, editing, dump, rawData, syncPolicy } = state;
    const { ID, username, properties, roles, aliases, fetchmail, ldapID, forward } = user; //eslint-disable-line
  const storageQuotaTooHigh = parseInt(properties.storagequotalimit) * (1024 ** sizeUnits.storagequotalimit) > 3221225472;

  return (
    <ViewWrapper
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
    >
      <Paper className={classes.paper} elevation={1}>
        <Grid2 container className={classes.header}>
          <Typography
            color="primary"
            variant="h5"
          >
            {t('editHeadline', { item: 'User' })} {properties.displayname ? ` - ${properties.displayname}` : ''}
          </Typography>
        </Grid2>
        {ldapID && <Grid2 container className={classes.syncButtons}>
          <Tooltip title={t("Detach user from LDAP object")} placement="top">
            <Button
              variant="contained"
              color="secondary"
              style={{ marginRight: 8 }}
              onClick={handleDetachDialog(true)}
              size="small"
            >
              <Detach fontSize="small" className={classes.leftIcon} /> {t("Detach")}
            </Button>
          </Tooltip>
          <Tooltip title={t("Synchronize data from LDAP")} placement="top">
            <Button
              size="small"
              onClick={handleSync}
              variant="contained"
              color="primary"
              style={{ marginRight: 8 }}
            >
              <Sync fontSize="small" className={classes.leftIcon}/> {t("Sync")}
            </Button>
          </Tooltip>
          <Tooltip title={t("Show raw data")} placement="top">
            <Button
              size="small"
              onClick={handleDump}
              variant="contained"
              color="primary"
            >
              <Dump fontSize="small" className={classes.leftIcon}/> {t("LDAP Dump")}
            </Button>
          </Tooltip>
        </Grid2>}
        <div className={classes.tabsContainer}>
          <Tabs
            value={tab}
            handleTabChange={handleTabChange}
            ID={ID}
            sysAdminReadPermissions={sysAdminReadPermissions}
          />
        </div>
        {tab === 0 && <Account
          domain={domainDetails.ID ? domainDetails : domain}
          user={user}
          sizeUnits={sizeUnits}
          langs={langs}
          handleInput={handleInput}
          handleStatusInput={handleStatusInput}
          handlePropertyChange={handlePropertyChange}
          handlePropertyCheckbox={handlePropertyCheckbox}
          handleIntPropertyChange={handleIntPropertyChange}
          handleCheckbox={handleCheckbox}
          handleUnitChange={handleUnitChange}
          handlePasswordChange={handlePasswordDialogToggle(true)}
          rawData={rawData}
          handleChatUser={handleChatUser}
          handleServer={handleServer}
          handleMultiselectChange={handleMultiselectChange}
          storageQuotaTooHigh={storageQuotaTooHigh}
        />}
        {tab === 1 && <Altnames
          user={user}
          handleAltnameEdit={handleAltnameEdit}
        />}
        {tab === 2 && <User
          user={user}
          handlePropertyChange={handlePropertyChange}
        />}
        {tab === 3 && <Contact
          user={user}
          handlePropertyChange={handlePropertyChange}
        />}
        {tab === 4 && sysAdminReadPermissions && <Roles
          roles={roles}
          handleAutocomplete={handleAutocomplete}
        />}
        {tab === 5 && <Smtp
          user={user}
          aliases={aliases}
          forward={forward || {}}
          forwardError={forwardError}
          handleForwardInput={handleForwardInput}
          handleAliasEdit={handleAliasEdit}
          handleAddAlias={handleAddAlias}
          handleRemoveAlias={handleRemoveAlias}
        />}
        {tab === 6 && ID && <Delegates
          domainID={domain.ID}
          orgID={domain.orgID}
          userID={user.ID}
          disabled={!writable}
        />}
        {tab === 7 && ID && <Oof
          domainID={domain.ID}
          userID={user.ID}
        />}
        {tab === 8 && <FetchMail
          fetchmail={fetchmail}
          handleAdd={handleFetchmailDialog(true)}
          handleEdit={handleFetchmailEditDialog}
          handleDelete={handleFetchmailDelete}
        />}
        {tab === 9 && ID && <SyncTab
          domainID={domain.ID}
          userID={user.ID}
        />}
        {tab === 10 && ID && <SyncPolicies
          syncPolicy={syncPolicy}
          defaultPolicy={defaultPolicy}
          handleChange={handleSyncChange}
          handleCheckbox={handleSyncCheckboxChange}
          handleSlider={handleSlider}
        />}
        {tab !== 6 && tab !== 7 && <Grid2 container className={classes.buttonGrid}>
          <Button
            onClick={() => navigate(-1)}
            style={{ marginRight: 8 }}
            color="secondary"
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={tab === 4 ? handleSaveRoles : handleEdit}
            disabled={!writable || forwardError || storageQuotaTooHigh}
          >
            {t('Save')}
          </Button>
        </Grid2>}
      </Paper>
      <DetachDialog
        open={detaching}
        loading={detachLoading}
        onClose={handleDetachDialog(false)}
        onDetach={handleDetach}
      />
      <AddFetchmail
        open={adding}
        add={addFetchmail}
        onClose={handleFetchmailDialog(false)}
        username={username + '@' + domain.domainname}
      />
      <EditFetchmail
        open={editing !== null}
        entry={editing !== null ? fetchmail[editing] : editing}
        edit={editFetchmail}
        onClose={handleFetchmailEditDialog(null)}
        username={username + '@' + domain.domainname}
      />
      <ChangeUserPassword
        onClose={handlePasswordDialogToggle(false)}
        onError={handleError}
        onSuccess={handleSuccess}
        changingPw={changingPw}
        domain={domain}
        user={user}
      />
      <DumpDialog onClose={handleCloseDump} open={!!dump} dump={dump} />
    </ViewWrapper>
  );
}

UserDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  sync: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchRoles: PropTypes.func.isRequired,
  editUserRoles: PropTypes.func.isRequired,
  fetchDomainDetails: PropTypes.func.isRequired,
  storeLangs: PropTypes.func.isRequired,
  dump: PropTypes.func.isRequired,
  fetchServers: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchUserData(domainID, userID))
      .then(user => user)
      .catch(msg => Promise.reject(msg)),
    fetchRoles: async () => {
      await dispatch(fetchRolesData({ sort: 'name,asc', level: 0, limit: 100000 }))
        .catch(msg => Promise.reject(msg));
    },
    fetchServers: async () => await dispatch(fetchServersData({ sort: 'hostname,asc', limit: 1000000, level: 0 }))
      .catch(message => Promise.reject(message)),
    fetchDomainDetails: async id => await dispatch(fetchDomainDetails(id))
      .then(domain => domain)
      .catch(msg => Promise.reject(msg)),
    edit: async (domainID, user) => {
      await dispatch(editUserData(domainID, user)).catch(msg => Promise.reject(msg));
    },
    editUserRoles: async (domainID, userID, roles) => {
      await dispatch(editUserRoles(domainID, userID, roles)).catch(msg => Promise.reject(msg));
    },
    storeLangs: async () => await dispatch(getStoreLangs()).catch(msg => Promise.reject(msg)),
    sync: async (domainID, userID) =>
      await dispatch(syncLdapData(domainID, userID))
        .then(user => Promise.resolve(user))
        .catch(msg => Promise.reject(msg)),
    dump: async params => await dispatch(fetchLdapDump(params))
      .then(data => Promise.resolve(data))
      .catch(msg => Promise.reject(msg)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(UserDetails, styles)));
