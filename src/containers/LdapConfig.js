import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TopBar from '../components/TopBar';
import { Button, Checkbox, FormControl, FormControlLabel, Paper,
  Portal, Snackbar, TextField, Typography } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';
import { fetchLdapConfig, updateLdapConfig } from '../actions/ldap';
import { connect } from 'react-redux';
import { cloneObject } from '../utils';
import DeleteConfig from '../components/Dialogs/DeleteConfig';
import { red } from '@material-ui/core/colors';
import { Alert } from '@material-ui/lab';

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
  tablePaper: {
    margin: theme.spacing(3, 2),
  },
  formControl: {
    width: '100%',
  },
  category: {
    margin: theme.spacing(2, 0, 0, 2),
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
    margin: theme.spacing(0, 2),
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
});

class LdapConfig extends PureComponent {

  state = {
    baseDn: '',
    objectID: '',
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
    attributes: {
      additionalProp1: '',
      additionalProp2: '',
      additionalProp3: '',
    },
    searchAttributes: '',

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
    formatted.users.attributes = copy.attributes;
    formatted.users.defaultQuota = parseInt(copy.defaultQuota);
    // Split multiline-strings to arrays of strings
    formatted.users.filters = copy.filters.split('\n');
    formatted.users.searchAttributes = copy.searchAttributes.split('\n');
    formatted.users.templates = copy.templates.split('\n');

    return formatted;
  }

  async componentDidMount() {
    const config = await this.props.fetch()
      .catch(snackbar => this.setState({ snackbar }));
    const { connection, users } = config;
    if(config.objectID && connection && users) this.setState({
      baseDn: config.baseDn,
      objectID: config.objectID,
      server: connection.server,
      bindUser: connection.bindUser,
      bindPass: connection.bindPass,
      starttls: connection.starttls,
      username: users.username,
      displayName: users.displayName,
      defaultQuota: users.defaultQuota,
      filters: this.arrayToString(users.filters),
      searchAttributes: this.arrayToString(users.searchAttributes),
      templates: this.arrayToString(users.templates),
      attributes: users.attributes,
    });
  }

  arrayToString(arr) {
    let string = '';
    const len = arr.length;
    for(let i = 0; i < len - 1; i++) {
      string += arr[i] + '\n';
    }
    string += arr[len - 1];
    return string;
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleInput = field => ({ target: t }) => this.setState({
    [field]: t.value,
  });

  handleAttributeInput = field => ({ target: t }) => this.setState({
    attributes: {
      ...this.state.attributes,
      [field]: t.value,
    },
  });

  handleCheckbox = e => this.setState({
    starttls: e.target.checked,
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
    const { deleting, snackbar, server, bindUser, bindPass, starttls, baseDn, objectID,
      username, filters, templates, attributes, defaultQuota, displayName, searchAttributes } = this.state;
    const { additionalProp1, additionalProp2, additionalProp3 } = attributes;

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
          <Paper className={classes.tablePaper} elevation={1}>
            <FormControl className={classes.formControl}>
              <TextField
                label={t('LDAP Base DN (baseDn)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('baseDn')}
                value={baseDn || ''}
              />
              <TextField
                label={t('Unique Identifier Attribute (objectID)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('objectID')}
                value={objectID || ''}
              />
              <Typography variant="h6" className={classes.category}>Connection</Typography>
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
                      onChange={this.handleCheckbox}
                      name="starttls"
                      color="primary"
                    />
                  }
                  label="STARTTLS"
                />
              </div>
              <Typography variant="h6" className={classes.category}>Users</Typography>
              <TextField
                label={t('LDAP Username Attribute (username)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('username')}
                value={username || ''}
              />
              <TextField
                label={t('LDAP Display Name Attribute (displayName)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('displayName')}
                value={displayName || ''}
              />
              <TextField
                label={t('LDAP Default Quota (defaultQuota)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('defaultQuota')}
                value={defaultQuota}
              />
              <TextField
                label={t('LDAP Filters (filters) - (separated by line)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('filters')}
                value={filters || ''}
                multiline
                rows={4}
              />
              <TextField
                label={t('LDAP Search Attributes - (searchAttributes) - (separated by line)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('searchAttributes')}
                value={searchAttributes}
                multiline
                rows={4}
              />
              <TextField
                label={t('LDAP Templates (templates) - (separated by line)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('templates')}
                value={templates}
                multiline
                rows={4}
              />
              <Typography variant="h6" className={classes.category}>Attributes</Typography>
              <div className={classes.flexRow}>
                <TextField
                  label={t('additionalProp1')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleAttributeInput('additionalProp1')}
                  value={additionalProp1 || ''}
                />
                <TextField
                  label={t('additionalProp2')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleAttributeInput('additionalProp2')}
                  value={additionalProp2 || ''}
                />
                <TextField
                  label={t('additionalProp3')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleAttributeInput('additionalProp3')}
                  value={additionalProp3 || ''}
                />
              </div>
            </FormControl>
            <div className={classes.textfield}>
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
          </Paper>
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