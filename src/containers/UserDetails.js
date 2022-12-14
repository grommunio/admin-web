// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  Button,
  Tabs, Tab, Tooltip,
} from '@mui/material';
import { connect } from 'react-redux';
import { fetchUserData, editUserData, editUserRoles, fetchLdapDump, editUserStore,
  deleteUserStore, getStoreLangs} from '../actions/users';
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
import SlimSyncPolicies from '../components/SlimSyncPolicies';
import Delegates from '../components/user/Delegates';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE, SYSTEM_ADMIN_READ } from '../constants';
import ViewWrapper from '../components/ViewWrapper';
import { fetchDomainDetails } from '../actions/domains';
import { debounce } from 'debounce';
import { checkFormat } from '../api';
import { fetchServersData } from '../actions/servers';
import Oof from '../components/user/Oof';

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
  scroller: {
    width: 0,
  },
});

/**
 * This is by far the biggest component in the app, tread with caution
 */
class UserDetails extends PureComponent {

  state = {
    adding: false,
    editing: null,
    user: {
      fetchmail: [],
      forward: {},
      roles: [],
      properties: {},
      aliases: [],
      status: 0,
    },
    syncPolicy: {},
    defaultPolicy: {},
    rawData: {},
    dump: '',
    changingPw: false,
    snackbar: '',
    tab: 0,
    langs: [],
    sizeUnits: {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    },
    detaching: false,
    detachLoading: false,
    domainDetails: {},
    forwardError: false,
    loading: true,
  };

  async componentDidMount() {
    const { fetch, fetchRoles, fetchDomainDetails, domain, storeLangs, fetchServers } = this.props;
    const splits = window.location.pathname.split('/');
    const user = await fetch(splits[1], splits[3])
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    const defaultPolicy = user.defaultPolicy || {};
    user.syncPolicy = user.syncPolicy || {};
    this.setState({ ...this.getStateOverwrite(user, defaultPolicy), loading: false });
    const langs = await storeLangs()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    // If Sys admin read-only permissions
    if(this.context.includes(SYSTEM_ADMIN_READ)) {
      fetchRoles()
        .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
      fetchServers()
        .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    }
    const domainDetails = await fetchDomainDetails(domain.ID);
    this.setState({ domainDetails, langs: langs || [] });
  }

  // Transformes backend json object to useable component state object
  getStateOverwrite(user, defaultPolicy) {
    if(!user) return;
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

  handleInput = field => event => {
    this.setState({
      user: {
        ...this.state.user,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleForwardInput = field => e => {
    const { user } = this.state;
    this.setState({
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
      this.debounceFetch(mail ? { email: encodeURIComponent(mail) } : null);
    }
  }

  // When sanitizing user input, only check every 200ms
  debounceFetch = debounce(async params => {
    if(!params) {
      this.setState({ forwardError: false });
    } else {
      const resp = await checkFormat(params)
        .catch(snackbar => this.setState({ snackbar, loading: false }));
      this.setState({ forwardError: !!resp?.email });
    }
  }, 200)

  handleStatusInput = async event => {
    const { user } = this.state;
    const { value } = event.target;
    const { edit, domain } = this.props;
    // Immediately write user status to DB
    await edit(domain.ID, {
      ID: user.ID,
      status: value,
    }).then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    this.setState({
      user: {
        ...user,
        status: value,
      },
      unsaved: true,
      changingPw: value === 0 && user.status === 4,
    });
  }

  handlePropertyChange = field => event => {
    const { user } = this.state;
    this.setState({
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

  handleIntPropertyChange = field => event => {
    const { user } = this.state;
    const value = event.target.value;
    const int = parseInt(value);
    if(!isNaN(int) || value === '') this.setState({
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

  /**
   * Handles saving the user
   * Before sending the user state object to the backend it needs to be transformed according to the API spec
   */
  handleEdit = () => {
    const { edit, domain, editStore } = this.props;
    const { user, sizeUnits, defaultPolicy, syncPolicy } = this.state;
    const { username, aliases, fetchmail, forward, properties, homeserver } = user;
    const { storagequotalimit, prohibitreceivequota, prohibitsendquota } = properties;

    // Don't send quotas if the textfield is empty. There is a seperate endpoint to delete quotas
    // Otherwise, convert quota (MiB, GiB or TiB) into KiB
    const storePayload = {
      messagesizeextended: undefined, // MSE is read-only
      storagequotalimit: [null, undefined, ""].includes(storagequotalimit) ? undefined : storagequotalimit * 2 ** (10 * sizeUnits.storagequotalimit),
      prohibitreceivequota: [null, undefined, ""].includes(prohibitreceivequota) ? undefined : prohibitreceivequota * 2
        ** (10 * sizeUnits.prohibitreceivequota),
      prohibitsendquota: [null, undefined, ""].includes(prohibitsendquota) ? undefined : prohibitsendquota * 2 ** (10 * sizeUnits.prohibitsendquota),
    };

    Promise.all([
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
          // Remove quotas from user props, they must only be sent to the user store (separate endpoint)
          messagesizeextended: undefined,
          storagequotalimit: undefined,
          prohibitreceivequota: undefined,
          prohibitsendquota: undefined,
        },
        syncPolicy: getPolicyDiff(defaultPolicy, syncPolicy), // Merge sync policies
        forward: forward?.forwardType !== undefined && forward.destination ? forward : null,
        roles: undefined,
        ldapID: undefined,
      }),
      // Only send store props if there are none-undefined values
      Object.keys(storePayload).filter(k => storePayload[k] !== undefined).length > 0 ?
        editStore(domain.ID, user.ID, storePayload)
        : () => null,
    ]).then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleSync = () => {
    const { sync, domain } = this.props;
    const { user } = this.state;
    sync(domain.ID, user.ID)
      .then(user => {
        const defaultPolicy = user.defaultPolicy || {};
        user.syncPolicy = user.syncPolicy || {};
        this.setState({
          ...this.getStateOverwrite(user, defaultPolicy), // New backend user object received -> convert to state objects
          snackbar: 'Success!',
        });
      }).catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleDump = () => {
    const { dump, domain } = this.props;
    const { ldapID } = this.state.user;
    dump({ ID: ldapID, organization: domain.orgID || 0 })
      .then(data => this.setState({ dump: data.data }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleSaveRoles = () => {
    const { editUserRoles, domain } = this.props;
    const { ID, roles } = this.state.user;
    editUserRoles(domain.ID, ID, { roles: roles })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleQuotaDelete = prop => () => {
    const { user } = this.state;
    const { deleteStoreProp, domain } = this.props;
    deleteStoreProp(domain.ID, user.ID, prop)
      .then(() => this.setState({
        snackbar: 'Success!',
        user: {
          ...user,
          properties: {
            ...user.properties,
            [prop]: undefined,
          },
        },
      }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleTabChange = (_, tab) => this.setState({ tab });

  handleAliasEdit = idx => event => {
    const { user } = this.state;
    const copy = [...user.aliases];
    copy[idx] = event.target.value;
    this.setState({ user: { ...user, aliases: copy } });
  }

  handleAddAlias = () => {
    const { user } = this.state;
    const copy = [...user.aliases];
    copy.push('');
    this.setState({ user: { ...user, aliases: copy } });
  }

  handleRemoveAlias = idx => () => {
    const { user } = this.state;
    const copy = [...user.aliases];
    copy.splice(idx, 1);
    this.setState({ user: { ...user, aliases: copy } });
  }

  handleCheckbox = field => e => {
    const { pop3_imap } = this.state.user;
    const { checked } = e.target;
    
    if(field === "privArchive") {
      this.setState({
        user: {
          ...this.state.user,
          // If archive is allowed, pop3 must be enabled
          "pop3_imap": checked || pop3_imap,
          [field]: checked,
        },
      });
    } else {
      this.setState({
        user: {
          ...this.state.user,
          [field]: checked,
        },
      });
    }
  }

  handleUnitChange = unit => event => this.setState({
    sizeUnits: {
      ...this.state.sizeUnits,
      [unit]: event.target.value,
    },
  });

  handleDetachDialog = detaching => () => this.setState({ detaching });
  
  handleDetach = () => {
    const { user } = this.state;
    const { domain, edit } = this.props;
    this.setState({ detachLoading: true });
    edit(domain.ID, { ID: user.ID, ldapID: null })
      .then(() => this.setState({
        user: {
          ...user,
          ldapID: null, // User detached from LDAP -> Remove LDAP ID
        },
        snackbar: 'Success!',
        detachLoading: false,
        detaching: false,
      }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error', detachLoading: false }));
  }

  handleCloseDump = () => this.setState({ dump: '' });

  handlePasswordDialogToggle = changingPw => () => this.setState({ changingPw });

  handleSuccess = () => this.setState({ snackbar: 'Success!' });

  handleError = msg => this.setState({ snackbar: msg.message || 'Unknown error' });

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      user: {
        ...this.state.user,
        [field]: newVal.map(r => r.ID ? r.ID : r),
      },
      unsaved: true,
    });
  }

  handleFetchmailDialog = state => () => this.setState({ adding: state })

  handleFetchmailEditDialog = state => () => this.setState({ editing: state })

  addFetchmail = entry => {
    const { user } = this.state;
    const fetchmail = [...user.fetchmail];
    fetchmail.push(entry);
    this.setState({
      user: {
        ...user,
        fetchmail,
      },
      adding: false,
    });
  }

  editFetchmail = entry => {
    const { user, editing } = this.state;
    const fetchmail = [...user.fetchmail];
    fetchmail[editing] = entry;
    this.setState({
      user: {
        ...user,
        fetchmail,
      },
      editing: null,
    });
  }

  handleFetchmailDelete = idx => e => {
    const { user } = this.state;
    const fetchmail = [...user.fetchmail];
    e.stopPropagation();
    fetchmail.splice(idx, 1);
    this.setState({
      user: {
        ...user,
        fetchmail,
      },
    });
  }

  handleSyncChange = field => event => {
    const { syncPolicy } = this.state;
    this.setState({
      syncPolicy: {
        ...syncPolicy,
        [field]: event.target.value,
      },
    });
  }

  handleSyncCheckboxChange = field => (event, newVal) => {
    const { syncPolicy } = this.state;
    this.setState({
      syncPolicy: {
        ...syncPolicy,
        [field]: newVal ? 1 : 0,
      },
    });
  }

  handleSlider = field => (event, newVal) => {
    const { syncPolicy } = this.state;
    this.setState({
      syncPolicy: {
        ...syncPolicy,
        [field]: newVal,
      },
    });
  }

  handleChatUser = e => {
    const { checked } = e.target;
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        chat: checked,
        chatAdmin: false,
        privChat: checked ? user.privChat : false,
      },
    });
  }

  handleServer =(e, newVal) => {
    this.setState({
      user: {
        ...this.state.user,
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
  handleMultiselectChange = field => event => {
    const { user } = this.state;
    const { value } = event.target;
    const mask = (value || []).reduce((prev, next) => prev | next, 0)  // bitwise OR array elements
    this.setState({
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

  render() {
    const { classes, t, domain, history } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const sysAdminReadPermissions = this.context.includes(SYSTEM_ADMIN_READ);
    const { loading, user, changingPw, snackbar, tab, sizeUnits, detachLoading, defaultPolicy, langs,
      detaching, adding, editing, dump, rawData, syncPolicy, domainDetails, forwardError } = this.state;
    const { ID, username, properties, roles, aliases, fetchmail, ldapID, forward } = user; //eslint-disable-line
    return (
      <ViewWrapper
        topbarTitle={t('Users')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
        loading={loading}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container className={classes.header}>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'User' })} {properties.displayname ? ` - ${properties.displayname}` : ''}
            </Typography>
          </Grid>
          {ldapID && <Grid container className={classes.syncButtons}>
            <Tooltip title={t("Detach user from LDAP object")} placement="top">
              <Button
                variant="contained"
                color="secondary"
                style={{ marginRight: 8 }}
                onClick={this.handleDetachDialog(true)}
                size="small"
              >
                <Detach fontSize="small" className={classes.leftIcon} /> {t("Detach")}
              </Button>
            </Tooltip>
            <Tooltip title={t("Synchronize data from LDAP")} placement="top">
              <Button
                size="small"
                onClick={this.handleSync}
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
                onClick={this.handleDump}
                variant="contained"
                color="primary"
              >
                <Dump fontSize="small" className={classes.leftIcon}/> {t("LDAP Dump")}
              </Button>
            </Tooltip>
          </Grid>}
          <div className={classes.tabsContainer}>
            <Tabs
              indicatorColor="primary"
              value={tab}
              onChange={this.handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              classes={{
                scroller: classes.scroller,
              }}
            >
              <Tab label={t("Account")} />
              <Tab label={t("User")} disabled={!ID}/>
              <Tab label={t("Contact")} disabled={!ID}/>
              <Tab label={t("Roles")} disabled={!ID || !sysAdminReadPermissions}/>
              <Tab label={t("SMTP")} disabled={!ID}/>
              <Tab label={t("Permissions")} disabled={!ID}/>
              <Tab label={t("OOF")} disabled={!ID}/>
              <Tab label={t("Fetchmail")} disabled={!ID}/>
              <Tab label={t("Mobile devices")} disabled={!ID}/>
              <Tab label={t("Sync policy")} disabled={!ID}/>
            </Tabs>
          </div>
          {tab === 0 && <Account
            domain={domainDetails.ID ? domainDetails : domain}
            user={user}
            sizeUnits={sizeUnits}
            langs={langs}
            handleInput={this.handleInput}
            handleStatusInput={this.handleStatusInput}
            handlePropertyChange={this.handlePropertyChange}
            handleIntPropertyChange={this.handleIntPropertyChange}
            handleCheckbox={this.handleCheckbox}
            handleUnitChange={this.handleUnitChange}
            handlePasswordChange={this.handlePasswordDialogToggle(true)}
            rawData={rawData}
            handleQuotaDelete={this.handleQuotaDelete}
            handleChatUser={this.handleChatUser}
            handleServer={this.handleServer}
            handleMultiselectChange={this.handleMultiselectChange}
          />}
          {tab === 1 && <User
            user={user}
            handlePropertyChange={this.handlePropertyChange}
          />}
          {tab === 2 && <Contact
            user={user}
            handlePropertyChange={this.handlePropertyChange}
          />}
          {tab === 3 && sysAdminReadPermissions && <Roles
            roles={roles}
            handleAutocomplete={this.handleAutocomplete}
          />}
          {tab === 4 && <Smtp
            user={user}
            aliases={aliases}
            forward={forward || {}}
            forwardError={forwardError}
            handleForwardInput={this.handleForwardInput}
            handleAliasEdit={this.handleAliasEdit}
            handleAddAlias={this.handleAddAlias}
            handleRemoveAlias={this.handleRemoveAlias}
          />}
          {tab === 5 && <Delegates
            domainID={domain.ID}
            orgID={domain.orgID}
            userID={user.ID}
            disabled={!writable}
          />}
          {tab === 6 && <Oof
            domainID={domain.ID}
            userID={user.ID}
          />}
          {tab === 7 && <FetchMail
            fetchmail={fetchmail}
            handleAdd={this.handleFetchmailDialog(true)}
            handleEdit={this.handleFetchmailEditDialog}
            handleDelete={this.handleFetchmailDelete}
          />}
          {tab === 8 && <SyncTab
            domainID={domain.ID}
            userID={user.ID}
          />}
          {tab === 9 && <SlimSyncPolicies
            syncPolicy={syncPolicy}
            defaultPolicy={defaultPolicy}
            handleChange={this.handleSyncChange}
            handleCheckbox={this.handleSyncCheckboxChange}
            handleSlider={this.handleSlider}
          />}
          {tab !== 5 && tab !== 6 && <Grid container className={classes.buttonGrid}>
            <Button
              onClick={history.goBack}
              style={{ marginRight: 8 }}
              color="secondary"
            >
              {t('Back')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={tab === 3 ? this.handleSaveRoles : this.handleEdit}
              disabled={!writable || forwardError}
            >
              {t('Save')}
            </Button>
          </Grid>}
        </Paper>
        <DetachDialog
          open={detaching}
          loading={detachLoading}
          onClose={this.handleDetachDialog(false)}
          onDetach={this.handleDetach}
        />
        <AddFetchmail
          open={adding}
          add={this.addFetchmail}
          onClose={this.handleFetchmailDialog(false)}
          username={username + '@' + domain.domainname}
        />
        <EditFetchmail
          open={editing !== null}
          entry={editing !== null ? fetchmail[editing] : editing}
          edit={this.editFetchmail}
          onClose={this.handleFetchmailEditDialog(null)}
          username={username + '@' + domain.domainname}
        />
        <ChangeUserPassword
          onClose={this.handlePasswordDialogToggle(false)}
          onError={this.handleError}
          onSuccess={this.handleSuccess}
          changingPw={changingPw}
          domain={domain}
          user={user}
        />
        <DumpDialog onClose={this.handleCloseDump} open={!!dump} dump={dump} />
      </ViewWrapper>
    );
  }
}

UserDetails.contextType = CapabilityContext;
UserDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  sync: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchRoles: PropTypes.func.isRequired,
  editUserRoles: PropTypes.func.isRequired,
  editStore: PropTypes.func.isRequired,
  deleteStoreProp: PropTypes.func.isRequired,
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
    editStore: async (domainID, user, props) => {
      await dispatch(editUserStore(domainID, user, props)).catch(msg => Promise.reject(msg));
    },
    deleteStoreProp: async (domainID, user, prop) => {
      await dispatch(deleteUserStore(domainID, user, prop)).catch(msg => Promise.reject(msg));
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
  withTranslation()(withStyles(styles)(UserDetails)));
