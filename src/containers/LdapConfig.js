import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TopBar from '../components/TopBar';
import { Button, Checkbox, FormControl, FormControlLabel, Paper, TextField, Typography } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';
import { fetchLdapConfig, updateLdapConfig } from '../actions/ldap';
import { connect } from 'react-redux';
import { cloneObject } from '../utils';

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
});

class LdapConfig extends PureComponent {

  state = {
    baseDn: '',
    objectID: '',
    connection: {
      server: '',
      bindUser: '',
      bindPass: '',
    },
    users: {
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
    },
  }

  async componentDidMount() {
    const config = await this.props.fetch();
    if(config.objectID) this.setState({
      ...config,
    });
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleInput = field => ({ target: t }) => this.setState({
    [field]: t.value,
  });

  handleConnectionInput = field => ({ target: t }) => this.setState({
    connection: {
      ...this.state.connection,
      [field]: t.value,
    },
  });

  handleUsersInput = field => ({ target: t }) => this.setState({
    users: {
      ...this.state.users,
      [field]: t.value,
    },
  });

  handleAttributeInput = field => ({ target: t }) => {
    const { users } = this.state;
    this.setState({
      users: {
        ...users,
        attributes: {
          ...users.attributes,
          [field]: t.value,
        },
      },
    });
  }

  handleCheckbox = e => this.setState({
    connection: {
      ...this.state.connection,
      starttls: e.target.checked,
    },
  });

  formatData() {
    // Deep copy of state
    const copy = cloneObject(this.state);
    const users = copy.users;
    // Convert defaultQuota to integer
    users.defaultQuota = parseInt(users.defaultQuota);
    // Split multiline-strings to arrays of strings
    users.filters = users.filters.split('\n');
    users.searchAttributes = users.searchAttributes.split('\n');
    users.templates = users.templates.split('\n');
    return copy;
  }

  handleSave = () => {
    this.props.put(this.formatData());
  }

  render() {
    const { classes, t } = this.props;
    const { connection, baseDn, objectID, users } = this.state;
    const { server, bindUser, bindPass, starttls } = connection;
    const { username, filters, templates, attributes, defaultQuota, displayName, searchAttributes } = users;
    const { additionalProp1, additionalProp2, additionalProp3 } = attributes;
    //console.log(this.state.users.filters);
    return (
      <div className={classes.root}>
        <TopBar />
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("LDAP configuration")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon} />
          </Typography>
          <Paper className={classes.tablePaper} elevation={1}>
            <FormControl className={classes.formControl}>
              <TextField
                label={t('baseDn')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('baseDn')}
                value={baseDn || ''}
              />
              <TextField
                label={t('objectID')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleInput('objectID')}
                value={objectID || ''}
              />
              <Typography variant="h6" className={classes.category}>Connection</Typography>
              <div className={classes.flexRow}>
                <TextField
                  label={t('server')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleConnectionInput('server')}
                  value={server || ''}
                />
                <TextField
                  label={t('bindUser')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleConnectionInput('bindUser')}
                  value={bindUser || ''}
                />
                <TextField
                  label={t('bindPass')}
                  className={classes.flexTextfield}
                  color="primary"
                  onChange={this.handleConnectionInput('bindPass')}
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
                  label="starttls"
                />
              </div>
              <Typography variant="h6" className={classes.category}>Users</Typography>
              <TextField
                label={t('username')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleUsersInput('username')}
                value={username || ''}
              />
              <TextField
                label={t('displayName')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleUsersInput('displayName')}
                value={displayName || ''}
              />
              <TextField
                label={t('defaultQuota')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleUsersInput('defaultQuota')}
                value={defaultQuota}
              />
              <TextField
                label={t('filters (seperate by line)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleUsersInput('filters')}
                value={filters || ''}
                multiline
                rows={4}
              />
              <TextField
                label={t('searchAttributes (seperate by line)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleUsersInput('searchAttributes')}
                value={searchAttributes}
                multiline
                rows={4}
              />
              <TextField
                label={t('templates (seperate by line)')}
                className={classes.textfield}
                color="primary"
                onChange={this.handleUsersInput('templates')}
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
                color="primary"
                onClick={this.handleSave}
              >
                {t('Save')}
              </Button>
            </div>
          </Paper>
        </div>
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