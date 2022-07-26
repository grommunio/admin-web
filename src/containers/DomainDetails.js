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
import SlimSyncPolicies from '../components/SlimSyncPolicies';
import { SYSTEM_ADMIN_READ, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { fetchServersData } from '../actions/servers';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';

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

class DomainListDetails extends PureComponent {

  state = {
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
    autocompleteInput: '',
  }

  statuses = [
    { name: 'Activated', ID: 0 },
    { name: 'Deactivated', ID: 3 },
  ]

  async componentDidMount() {
    const { fetch, fetchOrgs, fetchServers, capabilities } = this.props;
    if(capabilities.includes(SYSTEM_ADMIN_READ)) {
      await fetchOrgs()
        .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
      await fetchServers()
        .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    }
    const domain = await fetch(getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    const defaultPolicy = domain.defaultPolicy;
    domain.syncPolicy = domain.syncPolicy || {};
    const domainOrg = this.props.orgs.find(o => o.ID === domain.orgID);
    this.setState({
      ...(domain || {}),
      autocompleteInput: domainOrg?.name || '',
      orgID: domainOrg,
      syncPolicy: {
        ...defaultPolicy,
        ...domain.syncPolicy,
        maxattsize: (domain.syncPolicy.maxattsize || defaultPolicy.maxattsize) / 1048576 || '',
      },
      defaultPolicy,
    });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleCheckbox = field => event => this.setState({
    [field]: event.target.checked,
    unsaved: true,
  });

  handleEdit = () => {
    const { ID, domainname, domainStatus, orgID, chat, homeserver,
      maxUser, title, address, adminName, tel, defaultPolicy, syncPolicy } = this.state;
    this.props.edit({
      ID,
      domainname,
      domainStatus,
      orgID: Number.isInteger(orgID) ? orgID : 0,
      maxUser: parseInt(maxUser) || null,
      title,
      address,
      adminName,
      tel,
      homeserver: homeserver?.ID || null,
      syncPolicy: getPolicyDiff(defaultPolicy, syncPolicy),
      chat,
    })
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handlePasswordChange = async () => {
    const { domain, newPw } = this.state;
    await changeDomainPassword(domain.ID, newPw);
    this.setState({ changingPw: false });
  }

  handleKeyPress = event => {
    const { newPw, checkPw } = this.state;
    if(event.key === 'Enter' && newPw === checkPw) this.handlePasswordChange();
  }

  handleBack = () => {
    const { capabilities } = this.props;
    if(capabilities.includes(SYSTEM_ADMIN_READ)) this.props.history.push('/domains');
    else this.props.history.push('/' + getStringAfterLastSlash());
  }

  handleTab = (e, tab) => this.setState({ tab })

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

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal?.ID || '',
      autocompleteInput: newVal?.name || '',
    });
  }

  handleServer =(e, newVal) => {
    this.setState({
      homeserver: newVal || '',
    });
  }

  render() {
    const { classes, t, orgs, capabilities, servers } = this.props;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    const { domainname, domainStatus, orgID, maxUser, title, address, adminName,
      tel, syncPolicy, checkPw, newPw, changingPw, snackbar, tab, defaultPolicy,
      chat, homeserver, autocompleteInput } = this.state;
    
    return (
      <ViewWrapper
        topbarTitle={t('Domains')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Domain' })}
            </Typography>
          </Grid>
          <Tabs className={classes.tabs} indicatorColor="primary" onChange={this.handleTab} value={tab}>
            <Tab value={0} label={t("Domain")} />
            <Tab value={1} label={t("Sync policy")} />
          </Tabs>
          {tab === 0 && <FormControl className={classes.form}>
            <Grid container className={classes.input}>
              <TextField
                label={t("Domain")} 
                style={{ flex: 1, marginRight: 8 }} 
                value={domainname || ''}
                autoFocus
                disabled
              />
            </Grid>
            <TextField
              select
              className={classes.input}
              label={t("Status")}
              fullWidth
              value={domainStatus || 0}
              onChange={this.handleInput('domainStatus')}
            >
              {this.statuses.map((status, key) => (
                <MenuItem key={key} value={status.ID}>
                  {t(status.name)}
                </MenuItem>
              ))}
            </TextField>
            {capabilities.includes(SYSTEM_ADMIN_READ) && <MagnitudeAutocomplete
              value={orgID}
              filterAttribute={'name'}
              onChange={this.handleAutocomplete('orgID')}
              className={classes.input} 
              options={orgs}
              inputValue={autocompleteInput}
              onInputChange={this.handleInput('autocompleteInput')}
              label={t('Organization')}
            />}
            <TextField 
              className={classes.input} 
              label={t("Maximum users")} 
              fullWidth 
              value={maxUser || ''}
              onChange={this.handleInput('maxUser')}
            />
            <TextField 
              className={classes.input} 
              label={t("Title")} 
              fullWidth 
              value={title || ''}
              onChange={this.handleInput('title')}
            />
            <TextField 
              className={classes.input} 
              label={t("Address")} 
              fullWidth 
              value={address || ''}
              onChange={this.handleInput('address')}
            />
            <TextField 
              className={classes.input} 
              label={t("Administrator")} 
              fullWidth 
              value={adminName || ''}
              onChange={this.handleInput('adminName')}
            />
            <TextField 
              className={classes.input} 
              label={t("Telephone")} 
              fullWidth 
              value={tel || ''}
              onChange={this.handleInput('tel')}
            />
            <MagnitudeAutocomplete
              value={homeserver}
              filterAttribute={'hostname'}
              onChange={this.handleServer}
              className={classes.input} 
              options={servers}
              label={t('Homeserver')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={chat || false}
                  onChange={this.handleCheckbox('chat')}
                  color="primary"
                />
              }
              className={classes.input} 
              label={t('grommunio-chat Team')}
            />
          </FormControl>}
          {tab === 1 && <SlimSyncPolicies
            syncPolicy={syncPolicy}
            defaultPolicy={defaultPolicy}
            handleChange={this.handleSyncChange}
            handleCheckbox={this.handleSyncCheckboxChange}
            handleSlider={this.handleSlider}
          />}
          <Button
            color="secondary"
            onClick={this.handleBack}
            style={{ marginRight: 8 }}
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleEdit}
            disabled={!writable}
          >
            {t('Save')}
          </Button>
        </Paper>
        <Dialog open={!!changingPw} onClose={() => this.setState({ changingPw: false })}>
          <DialogTitle>{t('Change password')}</DialogTitle>
          <DialogContent>
            <TextField 
              className={classes.input} 
              label={t("New password")} 
              fullWidth
              type="password"
              value={newPw}
              onChange={event => this.setState({ newPw: event.target.value })}
              autoFocus
              onKeyPress={this.handleKeyPress}
            />
            <TextField 
              className={classes.input} 
              label={t("Repeat new password")} 
              fullWidth
              type="password"
              value={checkPw}
              onChange={event => this.setState({ checkPw: event.target.value })}
              onKeyPress={this.handleKeyPress}
            />
          </DialogContent>
          <DialogActions>
            <Button
              color="secondary"
              onClick={() => this.setState({ changingPw: false })}>
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handlePasswordChange}
              disabled={checkPw !== newPw}
            >
              {t('Save')}
            </Button>
          </DialogActions>
        </Dialog>
      </ViewWrapper>
    );
  }
}

DomainListDetails.contextType = CapabilityContext;
DomainListDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
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
  withTranslation()(withStyles(styles)(DomainListDetails)));
