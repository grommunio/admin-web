// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
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
import Feedback from '../Feedback';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { CapabilityContext } from '../../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../../constants';
import { withRouter } from '../../hocs/withRouter';

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


const Delegates = props => {
  const [state, setState] = useState({
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
  });
  const context = useContext(CapabilityContext);

  useEffect(() => {
    const fetchData = async () => {
      const { fetchDelegates, fetchSendAs, fetchPermittedUsers, fetchUsers, fetchOrgUsers, userID, domainID, orgID } = props;
      const sysAdminPermissions = context.includes(SYSTEM_ADMIN_WRITE);
  
      (sysAdminPermissions && orgID ? fetchOrgUsers(orgID) : fetchUsers(domainID))
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      const delegates = await fetchDelegates(domainID, userID)
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      const sendAsUsers = await fetchSendAs(domainID, userID)
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      const permittedUsers = await fetchPermittedUsers(domainID, userID)
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      setState({
        ...state, 
        delegates: delegates?.data?.sort() || [],
        permittedUsers: permittedUsers?.data?.map(u => u.username).sort() || [],
        sendAsUsers: sendAsUsers?.data?.sort() || [],
      });
    }

    fetchData();
  }, []);

  const handleInput = field => event => {
    setState({
      ...state, 
      [field]: event.target.value,
    });
  }

  const handleAutocomplete = (field, editField) => (e, newVal) => {
    setState({
      ...state, 
      [field]: newVal.map(r => r.username ? r.username : r).sort(),
      [editField]: true,
      delegatesACInput: '',
      sendAsACInput: '',
      puACInput: '',
    });
  }

  const handleSave = () => {
    const { setUserDelegates, setUserSendAs, setPermittedUserData, userID, domainID } = props;
    const { delegates, permittedUsers, sendAsUsers, dEdited, sEdited, puEdited } = state;
    if(dEdited) setUserDelegates(domainID, userID, delegates)
      .then(() => setState({
        ...state, 
        snackbar: 'Success!',
        delegatesACInput: '',
        puACInput: '',
        sendAsACInput: '',
      })).catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));

    if(sEdited) setUserSendAs(domainID, userID, sendAsUsers)
      .then(() => setState({
        ...state, 
        snackbar: 'Success!',
        delegatesACInput: '',
        puACInput: '',
        sendAsACInput: '',
      })).catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
    
    if(puEdited) setPermittedUserData(domainID, userID, {
      usernames: permittedUsers,
    })
      .then(() => setState({
        ...state, 
        snackbar: 'Success!',
        delegatesACInput: '',
        puACInput: '',
        sendAsACInput: '',
      })).catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const { classes, t, Users, userID, navigate, disabled } = props;
  const { delegates, sendAsUsers, snackbar, delegatesACInput, puACInput, permittedUsers, sendAsACInput } = state;
  const defaultTfProps = {
    multiple: true,
    filterAttribute: 'username',
    className: classes.input,
    options: Users.filter(u => u.ID !== userID) || [],
    isOptionEqualToValue: (option, value) => option.username === value,
    getOptionLabel: (sendAsUser) => sendAsUser.username || sendAsUser || '',
    placeholder: t("Search users") + "...",
  };
  return (
    <>
      <FormControl className={classes.form}>
        <Typography variant="h6" className={classes.headline}>{t('Mailbox permissions')}</Typography>
        <FormControl className={classes.input}>
          <MagnitudeAutocomplete
            {...defaultTfProps}
            value={delegates || []}
            inputValue={delegatesACInput}
            onChange={handleAutocomplete('delegates', 'dEdited')}
            onInputChange={handleInput('delegatesACInput')}
            label={t('Delegates')}
          />
          <MagnitudeAutocomplete
            {...defaultTfProps}
            value={sendAsUsers || []}
            inputValue={sendAsACInput}
            onChange={handleAutocomplete('sendAsUsers', 'sEdited')}
            onInputChange={handleInput('sendAsACInput')}
            label={t('Send as')}
          />
          <MagnitudeAutocomplete
            {...defaultTfProps}
            value={permittedUsers || []}
            inputValue={puACInput}
            onChange={handleAutocomplete('permittedUsers', 'puEdited')}
            onInputChange={handleInput('puACInput')}
            label={t('Full permission users')}
          />
        </FormControl>
      </FormControl>
      <Grid container className={classes.buttonGrid}>
        <Button
          onClick={() => navigate(-1)}
          style={{ marginRight: 8 }}
          color="secondary"
        >
          {t('Back')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={disabled}
        >
          {t('Save')}
        </Button>
      </Grid>
      <Feedback
        snackbar={snackbar}
        onClose={() => setState({ ...state, snackbar: '' })}
      />
    </>
  );
}

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
  navigate: PropTypes.func.isRequired,
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
    fetchUsers: async domainID => await dispatch(fetchPlainUsersData(domainID, { status: 0 }))
      .catch(err => console.error(err)),
    fetchOrgUsers: async orgID => await dispatch(fetchAllUsers({orgID, limit: 1000000, sort: 'username,asc', level: 0, status: 0}))
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
