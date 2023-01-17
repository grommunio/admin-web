// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent } from 'react';
import { Button, FormControl, Grid, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { fetchPermittedUsers, fetchUserDelegates, fetchPlainUsersData, setUserDelegates,
  setPermittedUserData, 
  fetchUserSendAs, 
  setUserSendAs,
  fetchAllUsers} from '../../actions/users';
import { withRouter } from 'react-router';
import Feedback from '../Feedback';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { CapabilityContext } from '../../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../../constants';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1, 1, 1, 1),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  buttonGrid: {
    margin: theme.spacing(1, 0, 0, 1),
  },
});

class Delegates extends PureComponent {

  state = {
    delegates: [],
    sendAsUsers: [],
    permittedUsers: [],
    snackbar: '',
    delegatesACInput: '',
    sendAsACInput: '',
    puACInput: '',
    dEdited: false,
    sEdited: false,
    puEdited: false,
  };

  async componentDidMount() {
    const { fetchDelegates, fetchSendAs, fetchPermittedUsers, fetchUsers, fetchOrgUsers, userID, domainID, orgID } = this.props;
    const sysAdminPermissions = this.context.includes(SYSTEM_ADMIN_WRITE);

    (sysAdminPermissions && orgID ? fetchOrgUsers(orgID) : fetchUsers(domainID))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    const delegates = await fetchDelegates(domainID, userID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    const sendAsUsers = await fetchSendAs(domainID, userID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    const permittedUsers = await fetchPermittedUsers(domainID, userID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      delegates: delegates?.data || [],
      permittedUsers: permittedUsers?.data?.map(u => u.username) || [],
      sendAsUsers: sendAsUsers?.data || [],
    });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleAutocomplete = (field, editField) => (e, newVal) => {
    this.setState({
      [field]: newVal.map(r => r.username ? r.username : r),
      [editField]: true,
      delegatesACInput: '',
      sendAsACInput: '',
      puACInput: '',
    });
  }

  handleSave = () => {
    const { setUserDelegates, setUserSendAs, setPermittedUserData, userID, domainID } = this.props;
    const { delegates, permittedUsers, sendAsUsers, dEdited, sEdited, puEdited } = this.state;
    if(dEdited) setUserDelegates(domainID, userID, delegates)
      .then(() => this.setState({
        snackbar: 'Success!',
        delegatesACInput: '',
        puACInput: '',
        sendAsACInput: '',
      })).catch(message => this.setState({ snackbar: message || 'Unknown error' }));

    if(sEdited) setUserSendAs(domainID, userID, sendAsUsers)
      .then(() => this.setState({
        snackbar: 'Success!',
        delegatesACInput: '',
        puACInput: '',
        sendAsACInput: '',
      })).catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    
    if(puEdited) setPermittedUserData(domainID, userID, {
      usernames: permittedUsers,
    })
      .then(() => this.setState({
        snackbar: 'Success!',
        delegatesACInput: '',
        puACInput: '',
        sendAsACInput: '',
      })).catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  render() {
    const { classes, t, Users, userID, history, disabled } = this.props;
    const { delegates, sendAsUsers, snackbar, delegatesACInput, puACInput, permittedUsers, sendAsACInput } = this.state;
    const defaultTfProps = {
      multiple: true,
      filterAttribute: 'username',
      className: classes.input,
      options: Users.filter(u => u.ID !== userID) || [],
      getOptionLabel: (sendAsUser) => sendAsUser.username || sendAsUser || '',
      placeholder: t("Search users") + "...",
    }
    return (
      <>
        <FormControl className={classes.form}>
          <Typography variant="h6" className={classes.headline}>{t('Mailbox permissions')}</Typography>
          <FormControl className={classes.input}>
            <MagnitudeAutocomplete
              {...defaultTfProps}
              value={delegates || []}
              inputValue={delegatesACInput}
              onChange={this.handleAutocomplete('delegates', 'dEdited')}
              onInputChange={this.handleInput('delegatesACInput')}
              label={t('Delegates')}
            />
            <MagnitudeAutocomplete
              {...defaultTfProps}
              value={sendAsUsers || []}
              inputValue={sendAsACInput}
              onChange={this.handleAutocomplete('sendAsUsers', 'sEdited')}
              onInputChange={this.handleInput('sendAsACInput')}
              label={t('Send as')}
            />
            <MagnitudeAutocomplete
              {...defaultTfProps}
              value={permittedUsers || []}
              inputValue={puACInput}
              onChange={this.handleAutocomplete('permittedUsers', 'puEdited')}
              onInputChange={this.handleInput('puACInput')}
              label={t('Full permission users')}
            />
          </FormControl>
        </FormControl>
        <Grid container className={classes.buttonGrid}>
          <Button
            onClick={history.goBack}
            style={{ marginRight: 8 }}
            color="secondary"
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleSave}
            disabled={disabled}
          >
            {t('Save')}
          </Button>
        </Grid>
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: '' })}
        />
      </>
    );
  }
}

Delegates.contextType = CapabilityContext;
Delegates.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetchDelegates: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  fetchSendAs: PropTypes.func.isRequired,
  fetchOrgUsers: PropTypes.func.isRequired,
  fetchPermittedUsers: PropTypes.func.isRequired,
  Users: PropTypes.array.isRequired,
  domainID: PropTypes.number.isRequired,
  orgID: PropTypes.number.isRequired,
  userID: PropTypes.number.isRequired,
  setUserDelegates: PropTypes.func.isRequired,
  setUserSendAs: PropTypes.func.isRequired,
  setPermittedUserData: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
};

const mapStateToProps = state => {
  return { Users: state.users.Users };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDelegates: async (domainID, userID) => await dispatch(fetchUserDelegates(domainID, userID))
      .catch(err => console.error(err)),
    fetchSendAs: async (domainID, userID) => await dispatch(fetchUserSendAs(domainID, userID))
      .catch(err => console.error(err)),
    fetchPermittedUsers: async (domainID, userID) => await dispatch(fetchPermittedUsers(domainID, userID, {}))
      .catch(err => console.error(err)),
    fetchUsers: async domainID => await dispatch(fetchPlainUsersData(domainID))
      .catch(err => console.error(err)),
    fetchOrgUsers: async orgID => await dispatch(fetchAllUsers({orgID, limit: 1000000, sort: 'username,asc', level: 0}))
      .catch(err => console.error(err)),
    setUserDelegates: async (domainID, userID, delegates) =>
      await dispatch(setUserDelegates(domainID, userID, delegates))
        .catch(err => Promise.reject(err)),
    setUserSendAs: async (domainID, userID, sendAsUsers) =>
      await dispatch(setUserSendAs(domainID, userID, sendAsUsers))
        .catch(err => Promise.reject(err)),
    setPermittedUserData: async (domainID, folderID, permittedUsers) => 
      await dispatch(setPermittedUserData(domainID, folderID, permittedUsers))
        .catch(msg => Promise.reject(msg)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Delegates))));
