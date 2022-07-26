// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import TopBar from '../components/TopBar';
import { Button, Checkbox, FormControl, FormControlLabel, Grid, IconButton, MenuItem, Paper,
  Typography, Switch, Tooltip, TextField, RadioGroup, Radio, Autocomplete } from '@mui/material';
import { withTranslation } from 'react-i18next';
import blue from '../colors/blue';
import { fetchLdapConfig, syncLdapUsers, updateLdapConfig, updateAuthMgr, fetchAuthMgr } from '../actions/ldap';
import { connect } from 'react-redux';
import { cloneObject } from '../utils';
import DeleteConfig from '../components/Dialogs/DeleteConfig';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Close';
import { green, red } from '@mui/material/colors';
import adminConfig from '../config';
import LdapTextfield from '../components/LdapTextfield';
import Help from '@mui/icons-material/HelpOutline';
import Feedback from '../components/Feedback';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import TaskCreated from '../components/Dialogs/TaskCreated';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2, 2, 2, 2),
    flex: 1,
    display: 'flex',
    overflow: 'auto',
  }, 
  toolbar: theme.mixins.toolbar,
  pageTitle: {
    margin: theme.spacing(2, 2, 1, 2),
  },
  subtitle: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  homeIcon: {
    color: blue[500],
    position: 'relative',
    top: 4,
    left: 4,
    cursor: 'pointer',
  },
  paper: {
    margin: theme.spacing(3, 2, 1, 2),
    paddingBottom: 16,
  },
  formControl: {
    width: '100%',
  },
  category: {
    margin: theme.spacing(2, 0, 1, 2),
  },
  textfield: {
    margin: theme.spacing(2, 2, 2, 2),
  },
  flexContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    marginRight: 16,
  },
  flexTextfield: {
    flex: 1,
    margin: 8,
    minWidth: 400,
  },
  flexRow: {
    margin: theme.spacing(0, 1, 0, 1),
    flexWrap: 'wrap',
    display: 'flex',
  },
  deleteButton: {
    marginRight: 8,
    backgroundColor: red['500'],
    '&:hover': {
      backgroundColor: red['700'],
    },
  },
  bottomRow: {
    display: 'flex',
    padding: theme.spacing(2, 2, 4, 2),
  },
  spacer: {
    paddingTop: 16,
  },
  mappingTitle: {
    padding: theme.spacing(1, 1, 0, 2),
  },
  addButton: {
    padding: theme.spacing(1, 0, 0, 0),
  },
  removeButton: {
    margin: theme.spacing(1, 2, 0, 0),
  },
  attribute: {
    marginLeft: 8,
  },
  tooltip: {
    marginTop: -2,
  },
  subcaption: {
    margin: theme.spacing(1, 0, 0, 2),
  },
  radioGroup: {
    marginLeft: 16,
  },
});

class LdapConfig extends PureComponent {

  state = {
    baseDn: '',
    objectID: '',
    disabled: true,
    //Connection
    server: '',
    bindUser: '',
    bindPass: '',
    starttls: false,
    // Users
    username: '',
    displayName: '',
    defaultQuota: '',
    filter: '',
    templates: 'none',
    attributes: [],
    searchAttributes: [],
    authBackendSelection: 'externid',
    aliases: '',

    deleting: false,
    taskMessage: '',
    taskID: null,
    force: false,
    snackbar: '',
  }

  /* Formats state to new config object for backend */
  formatData() {
    // Create a deep copy of the object
    const copy = cloneObject(this.state);
    // New, in the end formatted, object
    const formatted = {};
    // Defaults
    formatted.baseDn = copy.baseDn;
    formatted.objectID  = copy.objectID;
    formatted.disabled = copy.disabled;
    // Format connection
    formatted.connection = {};
    formatted.connection.server = copy.server;
    formatted.connection.bindUser = copy.bindUser;
    formatted.connection.bindPass = copy.bindPass;
    formatted.connection.starttls = copy.starttls;

    //Format users
    formatted.users = {};
    formatted.users.username = copy.username;
    formatted.users.displayName = copy.displayName;
    formatted.users.attributes = this.arrayToObject([...this.state.attributes]);
    formatted.users.defaultQuota = parseInt(copy.defaultQuota) || undefined;
    formatted.users.filter = copy.filter; // Put single string in array (necessary)
    formatted.users.templates = copy.templates === 'none' ?
      [] : ['common', copy.templates]; // ['common', 'ActiveDirectory']
    formatted.users.searchAttributes = [...this.state.searchAttributes];
    formatted.users.aliases = copy.aliases;

    return formatted;
  }

  async componentDidMount() {
    const { fetch, fetchAuthMgr } = this.props;
    const resp = await fetch()
      .catch(snackbar => this.setState({ snackbar }));
    const authResp = await fetchAuthMgr()
      .catch(snackbar => this.setState({ snackbar }));
    const config = resp?.data;
    if(!config) return;
    const available = resp?.ldapAvailable || false;
    const connection = config?.connection || {};
    const users = config?.users || {};
    this.setState({
      authBackendSelection: authResp?.data?.authBackendSelection || 'always_mysql',
      available,
      baseDn: config.baseDn || '',
      disabled: config.disabled === undefined ? true : config.disabled,
      objectID: config.objectID || '',
      server: connection.server || '',
      bindUser: connection.bindUser || '',
      bindPass: connection.bindPass || '',
      starttls: connection.starttls || false,
      username: users.username || '',
      displayName: users.displayName || '',
      defaultQuota: users.defaultQuota || '',
      filter: users.filter || '',
      templates: users.templates && users.templates.length > 0 ? users.templates[1] : 'none',
      searchAttributes: users.searchAttributes || [],
      attributes: this.objectToArray(users.attributes || {}),
      aliases: users.aliases || '',
    });
  }

  objectToArray(obj) {
    const arr = [];
    Object.entries(obj).forEach(([key, value]) => arr.push({ key, value }));
    return arr;
  }

  arrayToObject(arr) {
    const obj = {};
    arr.forEach(attr => obj[attr.key] = attr.value);
    return obj;
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleInput = field => ({ target: t }) => this.setState({
    [field]: t.value,
  });

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal,
    });
  }

  handleTemplate = ({ target: t }) => {
    const templates = t.value;
    if(templates === 'ActiveDirectory') {
      this.setState({
        templates,
        objectID: 'objectGUID',
        username: 'mail',
        displayName: 'displayName',
        searchAttributes: ["mail", "givenName", "cn", "sn", "name", "displayName"],
        filter: "objectClass=user",
        aliases: 'proxyAddresses',
      });
    } else if(templates === 'OpenLDAP') {
      this.setState({
        templates,
        objectID: 'entryUUID',
        username: 'mail',
        displayName: 'displayName',
        searchAttributes: ["mail", "givenName", "cn", "sn", "displayName", "gecos"],
        filter: "objectClass=posixAccount",
        aliases: 'mailAlternativeAddress',
      });
    } else {
      this.setState({ templates });
    }
  }

  handleAttributeInput = (objectPart, idx) => ({ target: t }) => {
    const copy = [...this.state.attributes];
    copy[idx][objectPart] = t.value;
    this.setState({
      attributes: copy,
    });
  }

  handleNewRow = () => {
    const copy = [...this.state.attributes];
    copy.push({ key: '', value: '' });
    this.setState({
      attributes: copy,
    });
  }

  removeRow = idx => () => {
    const copy = [...this.state.attributes];
    copy.splice(idx, 1);
    this.setState({ attributes: copy });
  }

  handleCheckbox = field => () => this.setState({
    [field]: !this.state[field],
  });

  handleActive = () => {
    const { disabled, authBackendSelection } = this.state;
    this.setState({
      disabled: !disabled,
      authBackendSelection: disabled ? authBackendSelection : 'always_mysql',
    });
  }

  handleSave = e => {
    const { put, authMgr } = this.props;
    const { force, authBackendSelection } = this.state;
    e.preventDefault();
    Promise.all([
      put(this.formatData(), { force: force }),
      authMgr({ authBackendSelection }),
    ])
      .then(msg => this.setState({ snackbar: 'Success! ' + (msg || '') }))
      .catch(snackbar => this.setState({ snackbar }));
  }

  handleDelete = () => this.setState({ deleting: true });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteError = error => this.setState({ snackbar: error });

  handleSync = importUser => () => this.props.sync({ import: importUser })
    .then(response => {
      if(response?.taskID) {
        this.setState({
          taskMessage: response.message || 'Task created',
          loading: false,
          taskID: response.taskID,
        });
      } else {
        this.setState({ snackbar: 'Success! ' + (response || '') });
      }
    })
    .catch(snackbar => this.setState({ snackbar }));

  handleTaskClose = () => this.setState({
    taskMessage: "",
    taskID: null,
  })

  render() {
    const { classes, t } = this.props;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    const { available, force, deleting, snackbar, server, bindUser, bindPass, starttls, baseDn, objectID, disabled,
      username, filter, templates, attributes, defaultQuota, displayName, searchAttributes,
      authBackendSelection, aliases, taskMessage, taskID } = this.state;
    return (
      <div className={classes.root}>
        <TopBar />
        <div className={classes.toolbar}></div>
        <form className={classes.base} onSubmit={this.handleSave}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("LDAP Directory")}
            <Tooltip
              className={classes.tooltip}
              title={t("ldap_settingsHelp")}
              placement="top"
            >
              <IconButton
                size="small"
                href="https://docs.grommunio.com/admin/administration.html#ldap"
                target="_blank"
              >
                <Help fontSize="small"/>
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography variant="caption" className={classes.subtitle}>
            {t('ldap_sub')}
          </Typography>
          <Grid container className={classes.category}>
            <FormControlLabel
              control={
                <Switch
                  checked={!disabled}
                  onChange={this.handleActive}
                  name="disabled"
                  color="primary"
                />
              }
              label={<span>
                {t('LDAP enabled')}
                <Tooltip
                  className={classes.tooltip}
                  title={t("Enable LDAP service")}
                  placement="top"
                >
                  <IconButton size="small">
                    <Help fontSize="small"/>
                  </IconButton>
                </Tooltip>
              </span>}
            />
            <div className={classes.flexContainer}>
              <Tooltip placement="top" title={t("Synchronize already imported users")}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginRight: 16 }}
                  onClick={this.handleSync(false)}
                >
                  {t("Sync users")}
                </Button>
              </Tooltip>
              <Tooltip
                placement="top"
                title={t("ldap_import_tooltip")}
              >
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginRight: 16 }}
                  onClick={this.handleSync(true)}
                >
                  {t("Import users")}
                </Button>
              </Tooltip>
            </div>
          </Grid>
          <Typography
            color="inherit"
            variant="caption"
            style={{
              marginLeft: 16,
              color: available ? green['500'] : red['500'],
            }}
          >
            {!disabled && (available ? t('LDAP connectivity check passed') : t('LDAP connectivity check failed'))}
          </Typography>
          <Paper elevation={1} className={classes.paper}>
            <Typography variant="h6" className={classes.category}>{t('LDAP Server')}</Typography>
            <FormControl className={classes.formControl}>
              <div className={classes.flexRow}>
                <LdapTextfield
                  flex
                  label={t('LDAP Server')}
                  autoFocus
                  placeholder="ldap://[::1]:389/"
                  onChange={this.handleInput('server')}
                  value={server || ''}
                  desc={t("ldap_server_desc")}
                  id="url"
                  name="url"
                  autoComplete="url"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <LdapTextfield
                  flex
                  label={t("LDAP Bind DN")}
                  onChange={this.handleInput('bindUser')}
                  value={bindUser || ''}
                  desc={t("Distinguished Name used for binding")}
                  id="bindDn"
                  name="bindDn"
                  autoComplete="bindDn"
                />
                <LdapTextfield
                  flex
                  label={t('LDAP Bind Password')}
                  onChange={this.handleInput('bindPass')}
                  value={bindPass || ''}
                  desc={t("ldap_password_desc")}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={starttls || false}
                      onChange={this.handleCheckbox('starttls')}
                      name="starttls"
                      inputProps={{
                        autoComplete: 'starttls',
                        name: 'starttls',
                        id: 'starttls',
                      }}
                      color="primary"
                    />
                  }
                  label={<span>
                    {'STARTTLS'}
                    <Tooltip
                      className={classes.tooltip}
                      title="Whether to issue a StartTLS extended operation"
                      placement="top"
                    >
                      <IconButton size="small">
                        <Help fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                  </span>}
                />
              </div>
              <LdapTextfield
                label={t('LDAP Base DN')}
                onChange={this.handleInput('baseDn')}
                value={baseDn || ''}
                desc={t("Base DN to use for searches")}
                id="baseDn"
                name="baseDn"
                autoComplete="baseDn"
              />
            </FormControl>
          </Paper>
          <Paper elevation={1} className={classes.paper}>
            <Typography variant="h6" className={classes.category}>
              {t('User authentication mechanism')}
            </Typography>
            <FormControl className={classes.formControl}>
              <RadioGroup
                name="authBackendSelection"
                value={authBackendSelection}
                onChange={this.handleInput("authBackendSelection")}
                row
                className={classes.radioGroup}
                color="primary"
              >
                <FormControlLabel
                  value="externid"
                  control={<Radio color="primary"/>}
                  label={t("Automatic")}
                />
                <FormControlLabel value="always_mysql" control={<Radio color="primary"/>} label={t("Only MySQL")} />
                <FormControlLabel value="always_ldap" control={<Radio color="primary"/>} label={t("Only LDAP")} />
              </RadioGroup>
            </FormControl>
          </Paper>
          <Paper className={classes.paper} elevation={1}>
            <FormControl className={classes.formControl}>
              <Typography variant="h6" className={classes.category}>{t('Attribute Configuration')}</Typography>
              <LdapTextfield
                label={t('LDAP Template')}
                onChange={this.handleTemplate}
                value={templates}
                select
                desc={t("Mapping templates to use")}
                id="templates"
                name="templates"
                autoComplete="templates"
              >
                <MenuItem value='none'>{t('No template')}</MenuItem>
                <MenuItem value="OpenLDAP">OpenLDAP</MenuItem>
                <MenuItem value="ActiveDirectory">ActiveDirectory</MenuItem>
              </LdapTextfield>
              <LdapTextfield
                label={t('LDAP Filter')}
                onChange={this.handleInput('filter')}
                value={filter || ''}
                desc={t("LDAP search filter to apply to user lookup")}
                id="filter"
                name="filter"
                autoComplete="filter"
              />
              <LdapTextfield
                label={t('Unique Identifier Attribute')}
                onChange={this.handleInput('objectID')}
                value={objectID || ''}
                desc={t("ldap_oID_desc")}
                id="objectID"
                name="objectID"
                autoComplete="objectID"
              />
              <LdapTextfield
                label={t('LDAP Username Attribute')}
                onChange={this.handleInput('username')}
                value={username || ''}
                desc={t("ldap_username_desc")}
                id="username"
                name="username"
                autoComplete="username"
              />
              <LdapTextfield
                label={t('LDAP Display Name Attribute')}
                onChange={this.handleInput('displayName')}
                value={displayName || ''}
                desc={t("Name of the attribute that contains the name")}
                id="displayName"
                name="displayName"
                autoComplete="displayName"
              />
              <LdapTextfield
                label={t('LDAP Default Quota')}
                onChange={this.handleInput('defaultQuota')}
                value={defaultQuota}
                desc={t("ldap_defaultQuota_desc")}
                id="defaultQuota"
                name="defaultQuota"
                autoComplete="defaultQuota"
              />
              <LdapTextfield
                label={t('LDAP Aliases')}
                onChange={this.handleInput('aliases')}
                value={aliases}
                desc={t("LDAP alias mapping")}
                id="aliasMapping"
                name="aliasMapping"
                autoComplete="aliasMapping"
              />
            </FormControl>
          </Paper>
          <Paper elevation={1} className={classes.paper}>
            <Typography variant="h6" className={classes.category}>{t('LDAP Search Attributes')}</Typography>
            <Typography variant="caption" className={classes.category}>
              {t('ldap_attribute_desc')}
            </Typography>
            <Autocomplete
              value={searchAttributes || []}
              onChange={this.handleAutocomplete('searchAttributes')}
              className={classes.textfield}
              options={adminConfig.searchAttributes}
              multiple
              renderInput={(params) => (
                <TextField
                  {...params}
                />
              )}
            />
          </Paper>
          <Paper elevation={1} className={classes.paper}>
            <Typography variant="h6" className={classes.category}>
              {t('Custom Mapping')}
              <Tooltip
                className={classes.tooltip}
                title={t('ldap_mapping_desc')}
                placement="top"
              >
                <IconButton size="small">
                  <Help fontSize="small"/>
                </IconButton>
              </Tooltip>
            </Typography>
            {attributes.map((mapping, idx) =>
              <Grid className={classes.attribute} container alignItems="center" key={idx}>
                <LdapTextfield
                  label={t('Name')}
                  flex
                  onChange={this.handleAttributeInput('key', idx)}
                  value={mapping.key || ''}
                  desc={t("LDAP attribute to map")}
                />
                <Typography className={classes.spacer}>:</Typography>
                <LdapTextfield
                  label={t('Value')}
                  flex
                  onChange={this.handleAttributeInput('value', idx)}
                  value={mapping.value || ''}
                  desc={t("Name of the user property to map to")}
                />
                <IconButton
                  onClick={this.removeRow(idx)}
                  className={classes.removeButton}
                  size="large">
                  <Delete color="error" />
                </IconButton>
              </Grid>
            )}
            <Grid container justifyContent="center" className={classes.addButton}>
              <Button size="small" onClick={this.handleNewRow}>
                <Add color="primary" />
              </Button>
            </Grid>
          </Paper>
          <div className={classes.bottomRow}>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleDelete}
              className={classes.deleteButton}
            >
              {t('Delete config')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              onClick={this.handleSave}
              disabled={!writable}
            >
              {t('Save')}
            </Button>
            <FormControlLabel
              className={classes.attribute}
              control={
                <Checkbox
                  checked={force || false}
                  onChange={this.handleCheckbox('force')}
                  name="disabled"
                  color="primary"
                />
              }
              label={<span>
                {t('Force config save')}
                <Tooltip
                  className={classes.tooltip}
                  title={t("Save LDAP configuration even if it's faulty")}
                  placement="top"
                >
                  <IconButton size="small">
                    <Help fontSize="small"/>
                  </IconButton>
                </Tooltip>
              </span>}
            />
          </div>
        </form>
        <DeleteConfig
          open={deleting}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
        />
        <TaskCreated
          message={taskMessage}
          taskID={taskID}
          onClose={this.handleTaskClose}
        />
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: '' })}
        />
      </div>
    );
  }
}

LdapConfig.contextType = CapabilityContext;
LdapConfig.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  put: PropTypes.func.isRequired,
  sync: PropTypes.func.isRequired,
  authMgr: PropTypes.func.isRequired,
  fetchAuthMgr: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => await dispatch(fetchLdapConfig())
      .then(config => config)
      .catch(message => Promise.reject(message)),
    fetchAuthMgr: async () => await dispatch(fetchAuthMgr())
      .then(config => config)
      .catch(message => Promise.reject(message)),
    put: async (config, params) => await dispatch(updateLdapConfig(config, params))
      .then(msg => msg)
      .catch(message => Promise.reject(message)),
    authMgr: async (config) => await dispatch(updateAuthMgr(config))
      .then(msg => msg)
      .catch(message => Promise.reject(message)),
    sync: async params => await dispatch(syncLdapUsers(params))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(LdapConfig)));
