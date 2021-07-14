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
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { editDomainData, fetchDomainDetails } from '../actions/domains';
import TopBar from '../components/TopBar';
import { changeDomainPassword } from '../api';
import { getStringAfterLastSlash, getPolicyDiff } from '../utils';
import Feedback from '../components/Feedback';
import { fetchOrgsData } from '../actions/orgs';
import SlimSyncPolicies from '../components/SlimSyncPolicies';

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
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
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
  }

  statuses = [
    { name: 'Activated', ID: 0 },
    { name: 'Deactivated', ID: 3 },
  ]

  async componentDidMount() {
    const { fetch, fetchOrgs, capabilities } = this.props;
    if(capabilities.includes('SystemAdmin')) fetchOrgs()
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
    const { ID, domainname, domainStatus, orgID,
      maxUser, title, address, adminName, tel, defaultPolicy, syncPolicy } = this.state;
    this.props.edit({
      ID,
      domainname,
      domainStatus,
      orgID: Number.isInteger(orgID) ? orgID : null,
      maxUser: parseInt(maxUser) || null,
      title,
      address,
      adminName,
      tel,
      syncPolicy: getPolicyDiff(defaultPolicy, syncPolicy),
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
    if(capabilities.includes('SystemAdmin')) this.props.history.push('/domainList');
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

  render() {
    const { classes, t, orgs, capabilities } = this.props;
    const { domainname, domainStatus, orgID, maxUser, title, address, adminName,
      tel, syncPolicy, checkPw, newPw, changingPw, snackbar, tab, defaultPolicy } = this.state;
    return (
      <div className={classes.root}>
        <TopBar title={t("Domain list")}/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.setState({ changingPw: true })}
                  size="small"
                >
                  {t('Change password')}
                </Button>
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
              {capabilities.includes('SystemAdmin') && <TextField
                select
                className={classes.input}
                label={t("Organization")}
                fullWidth
                value={orgID || ''}
                onChange={this.handleInput('orgID')}
              >
                <MenuItem value='None'>{t('None')}</MenuItem>
                {orgs.map((org, key) => (
                  <MenuItem key={key} value={org.ID}>
                    {org.name}
                  </MenuItem>
                ))}
              </TextField>}
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
            >
              {t('Save')}
            </Button>
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
        </div>
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
      </div>
    );
  }
}

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
    fetchOrgs: async () => await dispatch(fetchOrgsData()).catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DomainListDetails)));
