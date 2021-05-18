import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TopBar from '../components/TopBar';
import { Button, Checkbox, FormControl, FormControlLabel, Grid, IconButton, Input, InputLabel, MenuItem, Paper,
  Select, Typography, Switch, Tooltip } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';
import { fetchLdapConfig, updateLdapConfig } from '../actions/ldap';
import { connect } from 'react-redux';
import { cloneObject } from '../utils';
import DeleteConfig from '../components/Dialogs/DeleteConfig';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Close';
import { red } from '@material-ui/core/colors';
import adminConfig from '../config';
import LdapTextfield from '../components/LdapTextfield';
import Help from '@material-ui/icons/HelpOutline';
import Feedback from '../components/Feedback';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflow: 'auto',
  }, 
  toolbar: theme.mixins.toolbar,
  pageTitle: {
    margin: theme.spacing(2),
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
    margin: theme.spacing(2, 2),
  },
  flexTextfield: {
    flex: 1,
    margin: 8,
    minWidth: 400,
  },
  flexRow: {
    margin: theme.spacing(0, 1),
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
});

class LdapConfig extends PureComponent {

  state = {
    baseDn: '',
    objectID: '',
    disabled: false,
    //Connection
    server: '',
    bindUser: '',
    bindPass: '',
    starttls: false,
    // Users
    username: '',
    displayName: '',
    defaultQuota: 0,
    filter: '',
    templates: 'none',
    attributes: [],
    searchAttributes: [],

    deleting: false,
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
    formatted.users.defaultQuota = parseInt(copy.defaultQuota);
    formatted.users.filter = copy.filter; // Put single string in array (necessary)
    formatted.users.templates = copy.templates === 'none' ?
      [] : ['common', copy.templates]; // ['common', 'ActiveDirectory']
    formatted.users.searchAttributes = [...this.state.searchAttributes];

    return formatted;
  }

  async componentDidMount() {
    const resp = await this.props.fetch()
      .catch(snackbar => this.setState({ snackbar }));
    const config = resp?.data;
    if(!config) return;
    const available = resp?.ldapAvailable;
    const connection = config?.connection;
    const users = config?.users || {};
    if(config.baseDn && connection) this.setState({
      available,
      baseDn: config.baseDn,
      disabled: config.disabled || false,
      objectID: config.objectID,
      server: connection.server,
      bindUser: connection.bindUser,
      bindPass: connection.bindPass,
      starttls: connection.starttls,
      username: users.username,
      displayName: users.displayName,
      defaultQuota: users.defaultQuota,
      filter: users.filter || '',
      templates: users.templates && users.templates.length > 0 ? users.templates[1] : 'none',
      searchAttributes: users.searchAttributes || [],
      attributes: this.objectToArray(users.attributes || {}),
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

  handleCheckbox = field => e => this.setState({
    [field]: e.target.checked,
  });

  handleSave = e => {
    e.preventDefault();
    this.props.put(this.formatData())
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(snackbar => this.setState({ snackbar }));
  }

  handleDelete = () => this.setState({ deleting: true });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteError = error => this.setState({ snackbar: error });

  render() {
    const { classes, t } = this.props;
    const { available, deleting, snackbar, server, bindUser, bindPass, starttls, baseDn, objectID, disabled,
      username, filter, templates, attributes, defaultQuota, displayName, searchAttributes } = this.state;

    return (
      <div className={classes.root}>
        <TopBar />
        <div className={classes.toolbar}></div>
        <form className={classes.base} onSubmit={this.handleSave}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("LDAP authentification")}
            <Tooltip
              className={classes.tooltip}
              title="LDAP server configuration.
                User sychronization can be found at the list of users of individual domains"
              placement="top"
            >
              <IconButton size="small">
                <Help fontSize="small"/>
              </IconButton>
            </Tooltip>
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon} />
          </Typography>
          <Grid container className={classes.category}>
            <FormControlLabel
              control={
                <Switch
                  checked={!disabled}
                  onChange={e => this.setState({ disabled: !e.target.checked})}
                  name="disabled"
                  color="primary"
                  disabled={available}
                />
              }
              label={<span>
                {t('LDAP enabled')}
                <Tooltip
                  className={classes.tooltip}
                  title="Enable LDAP service"
                  placement="top"
                >
                  <IconButton size="small">
                    <Help fontSize="small"/>
                  </IconButton>
                </Tooltip>
              </span>}
            />
          </Grid>
          <Paper elevation={1} className={classes.paper}>
            <Typography variant="h6" className={classes.category}>{t('LDAP Server')}</Typography>
            <FormControl className={classes.formControl}>
              <div className={classes.flexRow}>
                <LdapTextfield
                  flex
                  label={t('LDAP-Server (server)')}
                  onChange={this.handleInput('server')}
                  value={server || ''}
                  desc="Address of the LDAP server to connect to"
                  disabled={disabled}
                  id="url"
                  name="url"
                  autoComplete="url"
                />
                <LdapTextfield
                  flex
                  label={t("LDAP Bind User (bindUser)")}
                  onChange={this.handleInput('bindUser')}
                  value={bindUser || ''}
                  desc="DN of the user to perform initial bind with"
                  disabled={disabled}
                  id="username"
                  name="username"
                  autoComplete="username"
                />
                <LdapTextfield
                  flex
                  label={t('LDAP Bind Password (bindPass)')}
                  onChange={this.handleInput('bindPass')}
                  value={bindPass || ''}
                  desc="Password for bindUser"
                  disabled={disabled}
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
                      disabled={disabled}
                    />
                  }
                  label={<span>
                    {t('STARTTLS')}
                    <Tooltip
                      className={classes.tooltip}
                      title="Whether to initiate a StartTLS connection"
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
                label={t('LDAP Base DN (baseDn)')}
                onChange={this.handleInput('baseDn')}
                value={baseDn || ''}
                desc="Base DN to use for user search"
                disabled={disabled}
                id="baseDn"
                name="baseDn"
                autoComplete="baseDn"
              />
            </FormControl>
          </Paper>
          <Paper className={classes.paper} elevation={1}>
            <FormControl className={classes.formControl}>
              <Typography variant="h6" className={classes.category}>{t('Attribute Configuration')}</Typography>
              <LdapTextfield
                label={t('Unique Identifier Attribute (objectID)')}
                onChange={this.handleInput('objectID')}
                value={objectID || ''}
                desc="Name of an attribute that uniquely idetifies an LDAP object"
                disabled={disabled}
                id="objectID"
                name="objectID"
                autoComplete="objectID"
              />
              <LdapTextfield
                label={t('LDAP Username Attribute (username)')}
                onChange={this.handleInput('username')}
                value={username || ''}
                desc="Name of the attribute that corresponds to the username (e-mail address)"
                disabled={disabled}
                id="username"
                name="username"
                autoComplete="username"
              />
              <LdapTextfield
                label={t('LDAP Default Quota (defaultQuota)')}
                onChange={this.handleInput('defaultQuota')}
                value={defaultQuota}
                desc="Storage quota of imported users if no mapping exists"
                disabled={disabled}
                id="defaultQuota"
                name="defaultQuota"
                autoComplete="defaultQuota"
              />
              <LdapTextfield
                label={t('LDAP Display Name Attribute (displayName)')}
                onChange={this.handleInput('displayName')}
                value={displayName || ''}
                desc="Name of the attribute that contains the name"
                disabled={disabled}
                id="displayName"
                name="displayName"
                autoComplete="displayName"
              />
              <LdapTextfield
                label={t('LDAP Filter (filters)')}
                onChange={this.handleInput('filter')}
                value={filter || ''}
                desc="LDAP search filter to apply to user lookup"
                disabled={disabled}
                id="filter"
                name="filter"
                autoComplete="filter"
              />
              <LdapTextfield
                label={t('LDAP Templates (templates)')}
                onChange={this.handleInput('templates')}
                value={templates}
                select
                desc="List of mapping templates to use"
                disabled={disabled}
                id="templates"
                name="templates"
                autoComplete="templates"
              >
                <MenuItem value='none'>{t('No template')}</MenuItem>
                <MenuItem value="OpenLDAP">OpenLDAP</MenuItem>
                <MenuItem value="ActiveDirectory">ActiveDirectory</MenuItem>
              </LdapTextfield>
              <FormControl className={classes.textfield}>
                <InputLabel>
                  {t('LDAP Search Attributes (searchAttributes)')}
                  <Tooltip
                    className={classes.tooltip}
                    title="List of attributes to use for searching"
                    placement="top"
                  >
                    <IconButton size="small">
                      <Help fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </InputLabel>
                <Select
                  id="searchAttributes"
                  name="searchAttributes"
                  autoComplete="searchAttributes"
                  multiple
                  value={searchAttributes}
                  onChange={this.handleInput('searchAttributes')}
                  input={<Input />}
                  MenuProps={{
                    style: { maxHeight: 400 },
                  }}
                  disabled={disabled}
                >
                  {adminConfig.searchAttributes.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FormControl>
          </Paper>
          <Paper elevation={1} className={classes.paper}>
            <Typography variant="h6" className={classes.category}>
              {t('Custom Mapping')}
              <Tooltip
                className={classes.tooltip}
                title="LDAP attribute -> PropTag mapping to used for LDAP import.
                  Any mappings specified take precendence over active templates"
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
                  desc="Name of the PropTag the attribute maps to"
                  disabled={disabled}
                />
                <Typography className={classes.spacer}>:</Typography>
                <LdapTextfield
                  label={t('Value')}
                  flex
                  onChange={this.handleAttributeInput('value', idx)}
                  value={mapping.value || ''}
                  desc="Value of the PropTag the attribute maps to"
                  disabled={disabled}
                />
                <IconButton onClick={this.removeRow(idx)} className={classes.removeButton}>
                  <Delete color="error" />
                </IconButton>
              </Grid>
            )}
            <Grid container justify="center" className={classes.addButton}>
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
            >
              {t('Save')}
            </Button>
          </div>
        </form>
        <DeleteConfig
          open={deleting}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
        />
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: '' })}
        />
      </div>
    );
  }
}

LdapConfig.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  put: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => await dispatch(fetchLdapConfig())
      .then(config => config)
      .catch(message => Promise.reject(message)),
    put: async config => await dispatch(updateLdapConfig(config))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(LdapConfig)));