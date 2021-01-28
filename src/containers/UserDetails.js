// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  DialogTitle,
  DialogContent, Dialog, DialogActions,
  Tabs, Tab,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchUserData, editUserData, editUserRoles, fetchLdapDump } from '../actions/users';
import TopBar from '../components/TopBar';
import { changeUserPassword } from '../api';
import { fetchRolesData } from '../actions/roles';
import Sync from '@material-ui/icons/Sync';
import Detach from '@material-ui/icons/SyncDisabled';
import Dump from '@material-ui/icons/Receipt';
import { syncLdapData } from '../actions/ldap';
import DetachDialog from '../components/Dialogs/DetachDialog';
import DumpDialog from '../components/Dialogs/DumpDialog';
import Feedback from '../components/Feedback';
import Account from '../components/user/Account';
import User from '../components/user/User';
import Contact from '../components/user/Contact';
import Roles from '../components/user/Roles';
import Smtp from '../components/user/Smtp';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    padding: theme.spacing(2, 2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1),
  },
  propertyInput: {
    margin: theme.spacing(1),
    flex: 1,
  },
  toolbar: theme.mixins.toolbar,
  grid: {
    display: 'flex',
    margin: theme.spacing(1),
    flex: 1,
  },
  select: {
    minWidth: 60,
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  list: {
    padding: 0,
    marginTop: -8,
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  listTextfield: {
    flex: 1,
  },
  flexTextfield: {
    flex: 1,
    marginRight: 8,
  },
  column: {
    margin: theme.spacing(1, 2),
  },
  address: {
    height: 128,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  textarea: {
    height: 84,
  },
  gridItem: {
    display: 'flex',
  },
  syncButtons: {
    margin: theme.spacing(2, 0),
  },
  leftIcon: {
    marginRight: 4,
  },
});

class UserDetails extends PureComponent {

  state = {
    user: {
      roles: [],
      properties: {},
    },
    dump: '',
    changingPw: false,
    newPw: '',
    checkPw: '',
    snackbar: '',
    tab: 0,
    sizeUnit: 1,
    detaching: false,
    detachLoading: false,
  };

  async componentDidMount() {
    const { fetch, fetchRoles } = this.props;
    const splits = window.location.pathname.split('/');
    const user = await fetch(splits[1], splits[3]);
    fetchRoles()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));

    this.setState(this.getStateOverwrite(user));
  }

  getStateOverwrite(user) {
    const properties = {
      ...user.properties,
    };
    const username = user.username.slice(0, user.username.indexOf('@'));
    const roles = (user.roles && user.roles.map(role => role.ID)) || [];
    const storagequotalimit = properties.storagequotalimit;
    let sizeUnit = 1;
    // Covert to biggest possible sizeUnit
    if(storagequotalimit % 1073741824 === 0) {
      properties.storagequotalimit = storagequotalimit / 1073741824;
      sizeUnit = 3;
    } else if (storagequotalimit % 1048576 === 0) {
      properties.storagequotalimit = storagequotalimit / 1048576;
      sizeUnit = 2;
    } else {
      properties.storagequotalimit = storagequotalimit / 1024;
    }
    return {
      sizeUnit,
      user: {
        ...user,
        username,
        roles,
        properties,
      },
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
    this.setState({
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: parseInt(event.target.value) || '',
        },
      },
      unsaved: true,
    });
  }

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      user: {
        ...this.state.user,
        [field]: input,
      },
    });
  }

  handleEdit = () => {
    const { user } = this.state;
    this.props.edit(this.props.domain.ID, {
      ...user,
      aliases: user.aliases.filter(alias => alias !== ''),
      properties: {
        ...user.properties,
        storagequotalimit: user.properties.storagequotalimit * Math.pow(2, 10 * this.state.sizeUnit),
      },
      roles: undefined,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
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

  handlePasswordChange = async () => {
    const { user, newPw } = this.state;
    await changeUserPassword(this.props.domain.ID, user.ID, newPw)
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg.message || 'Unknown error' }));
    this.setState({ changingPw: false });
  }

  handleKeyPress = event => {
    const { newPw, checkPw } = this.state;
    if(event.key === 'Enter' && newPw === checkPw) this.handlePasswordChange();
  }

  handleMultiSelect = event => {
    const { options } = event.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(parseInt(options[i].value));
      }
    }
    this.setState({
      user: {
        ...this.state.user,
        roles: value,
      },
    });
  };

  handleSaveRoles = () => {
    const { editUserRoles, domain } = this.props;
    const { ID, roles } = this.state.user;
    editUserRoles(domain.ID, ID, { roles: roles })
      .then(() => this.setState({ snackbar: 'Success!' }))
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

  handleUnitChange = event => this.setState({ sizeUnit: event.target.value });

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

  render() {
    const { classes, t, domain } = this.props;
    const { user, changingPw, newPw, checkPw, snackbar, tab, sizeUnit, detachLoading, detaching, dump} = this.state;
    const { username, roles, aliases, ldapID } = user; //eslint-disable-line
    const usernameError = user.username && !user.username.match(/^([.0-9a-z_+-]+)$/);

    return (
      <div className={classes.root}>
        <TopBar title={t("Users")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('editHeadline', { item: 'User' })}
              </Typography>
            </Grid>
            {ldapID && <Grid container className={classes.syncButtons}>
              <Button
                variant="contained"
                color="secondary"
                style={{ marginRight: 8 }}
                onClick={this.handleDetachDialog(true)}
                size="small"
              >
                <Detach fontSize="small" className={classes.leftIcon} /> Detach
              </Button>
              <Button
                size="small"
                onClick={this.handleSync}
                variant="contained"
                color="primary"
                style={{ marginRight: 8 }}
              >
                <Sync fontSize="small" className={classes.leftIcon}/> Sync
              </Button>
              <Button
                size="small"
                onClick={this.handleDump}
                variant="contained"
                color="primary"
              >
                <Dump fontSize="small" className={classes.leftIcon}/> Dump
              </Button>
            </Grid>}
            <Tabs value={tab} onChange={this.handleTabChange}>
              <Tab label={t("Account")} />
              <Tab label={t("User")} />
              <Tab label={t("Contact")} />
              <Tab label={t("Roles")} />
              <Tab label={t("SMTP")} />
            </Tabs>
            {tab === 0 && <Account
              domain={domain}
              user={user}
              usernameError={usernameError}
              sizeUnit={sizeUnit}
              handleInput={this.handleInput}
              handlePropertyChange={this.handlePropertyChange}
              handleIntPropertyChange={this.handleIntPropertyChange}
              handleCheckbox={this.handleCheckbox}
            />}
            {tab === 1 && <User
              user={user}
              handlePropertyChange={this.handlePropertyChange}
            />}
            {tab === 2 && <Contact
              user={user}
              handlePropertyChange={this.handlePropertyChange}
            />}
            <FormControl className={classes.form}>
              {tab === 3 && <Roles
                roles={roles}
                handleMultiSelect={this.handleMultiSelect}
              />}
              {tab === 4 && <Smtp
                aliases={aliases}
                handleAliasEdit={this.handleAliasEdit}
                handleAddAlias={this.handleAddAlias}
                handleRemoveAlias={this.handleRemoveAlias}
              />}
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={this.props.history.goBack}
              style={{ marginRight: 8 }}
            >
              {t('Back')}
            </Button>
            {[0, 1, 2, 4].includes(tab) ? <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
              disabled={!username || usernameError}
            >
              {t('Save')}
            </Button> :
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleSaveRoles}
              >
                {t('Save')}
              </Button>}
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
        </div>
        <DetachDialog
          open={detaching}
          loading={detachLoading}
          onClose={this.handleDetachDialog(false)}
          onDetach={this.handleDetach}
        />
        <Dialog open={!!changingPw}>
          <DialogTitle>{t('Change password')}</DialogTitle>
          <DialogContent>
            <TextField 
              className={classes.input} 
              label={t("New password")} 
              fullWidth
              type="password"
              value={newPw}
              onChange={({ target }) => this.setState({ newPw: target.value })}
              autoFocus
              onKeyPress={this.handleKeyPress}
            />
            <TextField 
              className={classes.input} 
              label={t("Repeat new password")} 
              fullWidth
              type="password"
              value={checkPw}
              onChange={({ target }) => this.setState({ checkPw: target.value })}
              onKeyPress={this.handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ changingPw: false })}>
              {t('Cancel')}
            </Button>
            <Button
              color="primary"
              onClick={this.handlePasswordChange}
              disabled={checkPw !== newPw}
            >
              {t('Save')}
            </Button>
          </DialogActions>
        </Dialog>
        <DumpDialog onClose={this.handleCloseDump} open={!!dump} dump={dump} />
      </div>
    );
  }
}

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
    edit: async (domainID, user) => {
      await dispatch(editUserData(domainID, user)).catch(msg => Promise.reject(msg));
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
