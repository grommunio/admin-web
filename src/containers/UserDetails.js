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
  Button,
  Tabs, Tab, Tooltip,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchUserData, editUserData, editUserRoles, fetchLdapDump, editUserStore,
  deleteUserStore } from '../actions/users';
import { fetchRolesData } from '../actions/roles';
import Sync from '@material-ui/icons/Sync';
import Detach from '@material-ui/icons/SyncDisabled';
import Dump from '@material-ui/icons/Receipt';
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
import { DOMAIN_ADMIN_WRITE } from '../constants';
import ViewWrapper from '../components/ViewWrapper';
import { fetchDomainDetails } from '../actions/domains';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  syncButtons: {
    margin: theme.spacing(2, 0),
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
});

class UserDetails extends PureComponent {

  state = {
    adding: false,
    editing: null,
    user: {
      fetchmail: [],
      roles: [],
      properties: {},
    },
    syncPolicy: {},
    defaultPolicy: {},
    rawData: {},
    dump: '',
    changingPw: false,
    snackbar: '',
    tab: 0,
    sizeUnits: {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    },
    detaching: false,
    detachLoading: false,
    domainDetails: {},
  };

  async componentDidMount() {
    const { fetch, fetchRoles, fetchDomainDetails, domain } = this.props;
    const splits = window.location.pathname.split('/');
    const user = await fetch(splits[1], splits[3])
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    const domainDetails = await fetchDomainDetails(domain.ID);
    fetchRoles()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    const defaultPolicy = user.defaultPolicy || {};
    user.syncPolicy = user.syncPolicy || {};
    this.setState(this.getStateOverwrite(user, defaultPolicy, domainDetails));
  }

  getStateOverwrite(user, defaultPolicy, domainDetails) {
    if(!user) return;
    const properties = {
      ...user.properties,
    };
    const username = user.username.slice(0, user.username.indexOf('@'));
    const roles = (user.roles && user.roles.map(role => role.ID)) || [];
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
      domainDetails,
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

  handleEdit = () => {
    const { edit, domain, editStore } = this.props;
    const { user, sizeUnits, defaultPolicy, syncPolicy } = this.state;
    Promise.all([
      edit(domain.ID, {
        ...user,
        domainID: undefined,
        aliases: user.aliases.filter(alias => alias !== ''),
        fetchmail: user.fetchmail.map(e => { return {
          ...e,
          date: undefined,
          sslFingerprint: e.sslFingerprint ? e.sslFingerprint.toUpperCase() : undefined,
        };}),
        properties: {
          ...user.properties,
          messagesizeextended: undefined,
          storagequotalimit: undefined,
          prohibitreceivequota: undefined,
          prohibitsendquota: undefined,
        },
        syncPolicy: getPolicyDiff(defaultPolicy, syncPolicy),
        roles: undefined,
        ldapID: undefined,
      }),
      editStore(domain.ID, user.ID, {
        ...user.properties,
        messagesizeextended: undefined,
        storagequotalimit: user.properties.storagequotalimit * 2 ** (10 * sizeUnits.storagequotalimit) || undefined,
        prohibitreceivequota: user.properties.prohibitreceivequota * 2
          ** (10 * sizeUnits.prohibitreceivequota) || undefined,
        prohibitsendquota: user.properties.prohibitsendquota * 2 ** (10 * sizeUnits.prohibitsendquota) || undefined,
      }),
    ]).then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleSync = () => {
    const { sync, domain } = this.props;
    const { user } = this.state;
    sync(domain.ID, user.ID)
      .then(user => 
        this.setState({
          ...this.getStateOverwrite(user),
          snackbar: 'Success!',
        })
      )
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleDump = () => {
    const { dump } = this.props;
    dump({ ID: this.state.user.ldapID })
      .then(data => this.setState({ dump: data.data }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleKeyPress = event => {
    const { newPw, checkPw } = this.state;
    if(event.key === 'Enter' && newPw === checkPw) this.handlePasswordChange();
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
            [prop]: '',
          },
        },
      }))
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleTabChange = (e, tab) => this.setState({ tab });

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

  handleCheckbox = field => e => this.setState({
    user: {
      ...this.state.user,
      [field]: e.target.checked,
    },
  });

  handleUnitChange = unit => event => this.setState({
    sizeUnits: {
      ...this.state.sizeUnits,
      [unit]: event.target.value,
    },
  });

  handleDetachDialog = detaching => () => this.setState({ detaching });

  handleDetach = () => {
    const { domain, edit } = this.props;
    this.setState({ detachLoading: true });
    edit(domain.ID, { ID: this.state.user.ID, ldapID: null })
      .then(() => this.setState({
        user: {
          ...this.state.user,
          ldapID: null,
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

  handleSuccess = () => this.setState({ snackbar: 'Success!' });

  handleError = msg => this.setState({ snackbar: msg.message || 'Unknown error' });

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

  handleRadio = field => event => {
    const { syncPolicy } = this.state;
    this.setState({
      syncPolicy: {
        ...syncPolicy,
        [field]: parseInt(event.target.value),
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
    this.setState({
      chat: checked,
      chatAdmin: false,
    });
  }

  render() {
    const { classes, t, domain, history } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { user, changingPw, snackbar, tab, sizeUnits, detachLoading, defaultPolicy,
      detaching, adding, editing, dump, rawData, syncPolicy, domainDetails } = this.state;
    const { username, properties, roles, aliases, fetchmail, ldapID } = user; //eslint-disable-line
    return (
      <ViewWrapper
        topbarTitle={t('Users')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
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
            <Tooltip title="Detach user from LDAP object" placement="top">
              <Button
                variant="contained"
                color="secondary"
                style={{ marginRight: 8 }}
                onClick={this.handleDetachDialog(true)}
                size="small"
              >
                <Detach fontSize="small" className={classes.leftIcon} /> Detach
              </Button>
            </Tooltip>
            <Tooltip title="Synchronize data from LDAP" placement="top">
              <Button
                size="small"
                onClick={this.handleSync}
                variant="contained"
                color="primary"
                style={{ marginRight: 8 }}
              >
                <Sync fontSize="small" className={classes.leftIcon}/> Sync
              </Button>
            </Tooltip>
            <Tooltip title="Show raw data" placement="top">
              <Button
                size="small"
                onClick={this.handleDump}
                variant="contained"
                color="primary"
              >
                <Dump fontSize="small" className={classes.leftIcon}/> Dump
              </Button>
            </Tooltip>
          </Grid>}
          <Tabs indicatorColor="primary" value={tab} onChange={this.handleTabChange}>
            <Tab label={t("Account")} />
            <Tab label={t("User")} />
            <Tab label={t("Contact")} />
            <Tab label={t("Roles")} />
            <Tab label={t("SMTP")} />
            <Tab label={t("Delegates")} />
            <Tab label={t("FetchMail")} />
            <Tab label={t("Mobile devices")} />
            <Tab label={t("Sync policy")} />
          </Tabs>
          {tab === 0 && <Account
            domain={domainDetails.ID ? domainDetails : domain}
            user={user}
            sizeUnits={sizeUnits}
            handleInput={this.handleInput}
            handlePropertyChange={this.handlePropertyChange}
            handleIntPropertyChange={this.handleIntPropertyChange}
            handleCheckbox={this.handleCheckbox}
            handleUnitChange={this.handleUnitChange}
            handlePasswordChange={this.handlePasswordDialogToggle(true)}
            rawData={rawData}
            handleQuotaDelete={this.handleQuotaDelete}
            handleChatUser={this.handleChatUser}
          />}
          {tab === 1 && <User
            user={user}
            handlePropertyChange={this.handlePropertyChange}
          />}
          {tab === 2 && <Contact
            user={user}
            handlePropertyChange={this.handlePropertyChange}
          />}
          {tab === 3 && <Roles
            roles={roles}
            handleAutocomplete={this.handleAutocomplete}
          />}
          {tab === 4 && <Smtp
            aliases={aliases}
            handleAliasEdit={this.handleAliasEdit}
            handleAddAlias={this.handleAddAlias}
            handleRemoveAlias={this.handleRemoveAlias}
          />}
          {tab === 5 && <Delegates
            domainID={domain.ID}
            userID={user.ID}
            disabled={!writable}
          />}
          {tab === 6 && <FetchMail
            fetchmail={fetchmail}
            handleAdd={this.handleFetchmailDialog(true)}
            handleEdit={this.handleFetchmailEditDialog}
            handleDelete={this.handleFetchmailDelete}
          />}
          {tab === 7 && <SyncTab
            domain={domain.ID}
            user={user.ID}
          />}
          {tab === 8 && <SlimSyncPolicies
            syncPolicy={syncPolicy}
            defaultPolicy={defaultPolicy}
            handleChange={this.handleSyncChange}
            handleCheckbox={this.handleSyncCheckboxChange}
            handleSlider={this.handleSlider}
          />}
          {tab !== 5 && <Grid container className={classes.buttonGrid}>
            <Button
              variant="contained"
              onClick={history.goBack}
              style={{ marginRight: 8 }}
            >
              {t('Back')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={tab === 3 ? this.handleSaveRoles : this.handleEdit}
              disabled={!writable}
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
  dump: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchUserData(domainID, userID))
      .then(user => user)
      .catch(msg => Promise.reject(msg)),
    fetchRoles: async () => {
      await dispatch(fetchRolesData({ sort: 'name,asc' })).catch(msg => Promise.reject(msg));
    },
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
