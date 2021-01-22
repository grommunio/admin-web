import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TopBar from '../components/TopBar';
import { Button, Checkbox, FormControl, FormControlLabel, Grid, IconButton, Input, InputLabel, MenuItem, Paper,
  Portal, Select, Snackbar, TextField, Typography, Switch } from '@material-ui/core';
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
import { Alert } from '@material-ui/lab';
import adminConfig from '../config';

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
  },
  formControl: {
    width: '100%',
  },
  category: {
    margin: theme.spacing(2, 0, 1, 2),
  },
  textfield: {
    margin: theme.spacing(1, 2),
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
    padding: theme.spacing(1, 0),
  },
  removeButton: {
    margin: theme.spacing(1, 2, 0, 0),
  },
  attribute: {
    marginLeft: 8,
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
    filters: '',
    templates: '',
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
    formatted.users.filters = [copy.filters];
    formatted.users.templates = [copy.templates];
    formatted.users.searchAttributes = [...this.state.searchAttributes];

    return formatted;
  }

  async componentDidMount() {
    const resp = await this.props.fetch()
      .catch(snackbar => this.setState({ snackbar }));
    const config = resp.data;
    const { connection } = config;
    const users = config.users || {};
    if(config.objectID && connection) this.setState({
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
      filters: users.filters && users.filters.length > 0 ? users.filters[0] : [],
      templates: users.templates && users.templates.length > 0 ? users.templates[0] : [],
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

  handleSave = () => {
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
    const { deleting, snackbar, server, bindUser, bindPass, starttls, baseDn, objectID, disabled,
      username, filters, templates, attributes, defaultQuota, displayName, searchAttributes } = this.state;

    return (
      <div className={classes.root}>
        <TopBar />
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("LDAP authentification")}
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
                />
              }
              style={{ color: 'white' }}
              label="LDAP enabled"
            />
          </Grid>
          <Paper elevation={1} className={classes.paper}>
            <Typography variant="h6" className={classes.category}>LDAP Server</Typography>
            <FormControl className={classes.formControl}>
              <div className={classes.flexRow}>
                <TextField
                  label={t('LDAP-Server (server)')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleInput('server')}
                  value={server || ''}
                />
                <TextField
                  label={t('LDAP Bind User (bindUser)')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleInput('bindUser')}
                  value={bindUser || ''}
                />
                <TextField
                  label={t('LDAP Bind Password (bindPass)')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleInput('bindPass')}
                  value={bindPass || ''}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={starttls || false}
                      onChange={this.handleCheckbox('starttls')}
                      name="starttls"
                      color="primary"
                    />
                  }
                  label="STARTTLS"
                />
              </div>
              <TextField
                label={t('LDAP Base DN (baseDn)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('baseDn')}
                value={baseDn || ''}
              />
            </FormControl>
          </Paper>
          <Paper className={classes.paper} elevation={1}>
            <FormControl className={classes.formControl}>
              <Typography variant="h6" className={classes.category}>Attribute Configuration</Typography>
              <TextField
                label={t('Unique Identifier Attribute (objectID)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('objectID')}
                value={objectID || ''}
              />
              <TextField
                label={t('LDAP Username Attribute (username)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('username')}
                value={username || ''}
              />
              <TextField
                label={t('LDAP Default Quota (defaultQuota)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('defaultQuota')}
                value={defaultQuota}
              />
              <TextField
                label={t('LDAP Display Name Attribute (displayName)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('displayName')}
                value={displayName || ''}
              />
              <TextField
                label={t('LDAP Filters (filters)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('filters')}
                value={filters || ''}
              />
              <TextField
                label={t('LDAP Templates (templates)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('templates')}
                value={templates}
              />
              <FormControl className={classes.textfield}>
                <InputLabel>
                  {t('LDAP Search Attributes - (searchAttributes) - (separated by line)')}
                </InputLabel>
                <Select
                  multiple
                  value={searchAttributes}
                  onChange={this.handleInput('searchAttributes')}
                  input={<Input />}
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
            <Typography variant="h6" className={classes.category}>Custom Mapping</Typography>
            {attributes.map((mapping, idx) =>
              <Grid className={classes.attribute} container alignItems="center" key={idx}>
                <TextField
                  label={t('Key')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleAttributeInput('key', idx)}
                  value={mapping.key || ''}
                />
                <Typography className={classes.spacer}>:</Typography>
                <TextField
                  label={t('Value')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleAttributeInput('value', idx)}
                  value={mapping.value || ''}
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
              onClick={this.handleDelete}
              className={classes.deleteButton}
            >
              {t('Delete config')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleSave}
            >
              {t('Save')}
            </Button>
          </div>
        </div>
        <DeleteConfig
          open={deleting}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
        />
        <Portal>
          <Snackbar
            open={!!snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {snackbar}
            </Alert>
          </Snackbar>
        </Portal>
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