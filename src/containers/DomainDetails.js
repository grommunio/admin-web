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
} from '@material-ui/core';
import { connect } from 'react-redux';
import { editDomainData, fetchDomainDetails } from '../actions/domains';
import { changeDomainPassword } from '../api';
import { getStringAfterLastSlash, getPolicyDiff } from '../utils';
import { fetchOrgsData } from '../actions/orgs';
import SlimSyncPolicies from '../components/SlimSyncPolicies';
import { SYSTEM_ADMIN_READ, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import { Autocomplete } from '@material-ui/lab';
import ViewWrapper from '../components/ViewWrapper';

const styles = theme => ({
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
    syncPolicy: {},
    defaultPolicy: {},
    changingPw: false,
    newPw: '',
    checkPw: '',
    tab: 0,
    chat: false,
  }

  statuses = [
    { name: 'Activated', ID: 0 },
    { name: 'Deactivated', ID: 3 },
  ]

  async componentDidMount() {
    const { fetch, fetchOrgs, capabilities } = this.props;
    if(capabilities.includes(SYSTEM_ADMIN_READ)) fetchOrgs()
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    const domain = await fetch(getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    const defaultPolicy = domain.defaultPolicy;
    domain.syncPolicy = domain.syncPolicy || {};
    this.setState({
      ...(domain || {}),
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
    const { ID, domainname, domainStatus, orgID, chat,
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
    if(capabilities.includes(SYSTEM_ADMIN_READ)) this.props.history.push('/domainList');
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
    });
  }

  render() {
    const { classes, t, orgs, capabilities } = this.props;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    const { domainname, domainStatus, orgID, maxUser, title, address, adminName,
      tel, syncPolicy, checkPw, newPw, changingPw, snackbar, tab, defaultPolicy,
      chat } = this.state;
    return (
      <ViewWrapper
        topbarTitle={t('Domain list')}
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
            <Tab value={0} label={t('Domain')} />
            <Tab value={1} label={t('Sync policies')} />
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
              {writable && <Button
                variant="contained"
                color="primary"
                onClick={() => this.setState({ changingPw: true })}
                size="small"
              >
                {t('Change password')}
              </Button>}
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
                  {status.name}
                </MenuItem>
              ))}
            </TextField>
            {capabilities.includes(SYSTEM_ADMIN_READ) && <Autocomplete
              value={orgID}
              getOptionLabel={(orgID) => orgs.find(o => o.ID === orgID)?.name || ''}
              renderOption={(org) => org?.name || ''}
              onChange={this.handleAutocomplete('orgID')}
              className={classes.input} 
              options={orgs}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Organization")}
                />
              )}
              filterOptions={(options, state) =>
                options.filter(o => o.name.toLowerCase().includes(state.inputValue.toLowerCase()))}
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={chat}
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
            variant="contained"
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
              variant="contained"
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
  edit: PropTypes.func.isRequired,
  orgs: PropTypes.array.isRequired,
  capabilities: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    orgs: state.orgs.Orgs,
    capabilities: state.auth.capabilities,
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
    fetchOrgs: async () => await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 5000, level: 0 }))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainListDetails)));
