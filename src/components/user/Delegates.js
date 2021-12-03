// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent } from 'react';
import { Button, FormControl, Grid, TextField, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Autocomplete } from '@mui/lab';
import { fetchPermittedUsers, fetchUserDelegates, fetchUsersData, setUserDelegates,
  setPermittedUserData } from '../../actions/users';
import { withRouter } from 'react-router';
import Feedback from '../Feedback';
import { getAutocompleteOptions } from '../../utils';

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
    permittedUsers: [],
    snackbar: '',
    delegatesACInput: '',
    pUACInput: '',
    dEdited: false,
    puEdited: false,
  };

  async componentDidMount() {
    const { fetchDelegates, fetchPermittedUsers, fetchUsers, userID, domainID } = this.props;
    fetchUsers(domainID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    const delegates = await fetchDelegates(domainID, userID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    const permittedUsers = await fetchPermittedUsers(domainID, userID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    if(delegates) this.setState({ delegates: delegates.data });
    if(permittedUsers) this.setState({ permittedUsers: permittedUsers.data?.map(u => u.username) });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal.map(r => r.username ? r.username : r),
      [field === 'delegates' ? 'dEdited' : 'puEdited']: true,
      delegatesACInput: '',
      pUACInput: '',
    });
  }

  handleSave = () => {
    const { setUserDelegates, setPermittedUserData, userID, domainID } = this.props;
    const { delegates, permittedUsers, dEdited, puEdited } = this.state;
    console.log(delegates);
    if(dEdited) setUserDelegates(domainID, userID, delegates)
      .then(() => this.setState({
        snackbar: 'Success!',
        delegatesACInput: '',
        pUACInput: '',
      })).catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    
    if(puEdited) setPermittedUserData(domainID, userID, {
      usernames: permittedUsers,
    })
      .then(() => this.setState({
        snackbar: 'Success!',
        delegatesACInput: '',
        pUACInput: '',
      })).catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  render() {
    const { classes, t, Users, userID, history, disabled } = this.props;
    const { delegates, snackbar, delegatesACInput, pUACInput, permittedUsers } = this.state;
    return (
      <>
        <FormControl className={classes.form}>
          <Typography variant="h6" className={classes.headline}>{t('Mailbox permissions')}</Typography>
          <FormControl className={classes.input}>
            <Autocomplete
              multiple
              options={Users.filter(u => u.ID !== userID) || []}
              inputValue={delegatesACInput}
              filterOptions={getAutocompleteOptions('username')}
              noOptionsText={delegatesACInput.length < Math.round(Math.log10(Users.length) - 2) ?
                t('Filter more precisely') + '...' : t('No options')}
              value={delegates || []}
              onChange={this.handleAutocomplete('delegates')}
              getOptionLabel={(delegate) => delegate.username || delegate || ''}
              renderOption={(props, option) => (
                <li {...props} key={option.ID}>
                  {option.username || ''}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Delegates")}
                  placeholder="Search users..."
                  className={classes.input}
                  onChange={this.handleInput('delegatesACInput')}
                />
              )}
            />
            <Autocomplete
              multiple
              options={Users.filter(u => u.ID !== userID) || []}
              inputValue={pUACInput}
              filterOptions={getAutocompleteOptions('username')}
              noOptionsText={pUACInput.length < Math.round(Math.log10(Users.length) - 2) ?
                t('Filter more precisely') + '...' : t('No options')}
              value={permittedUsers || []}
              onChange={this.handleAutocomplete('permittedUsers')}
              getOptionLabel={(option) => option.username || option || ''}
              renderOption={(props, option) => (
                <li {...props} key={option.ID}>
                  {option.username || ''}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Full permission users")}
                  placeholder="Search users..."
                  className={classes.input}
                  onChange={this.handleInput('pUACInput')}
                />
              )}
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

Delegates.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetchDelegates: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  fetchPermittedUsers: PropTypes.func.isRequired,
  Users: PropTypes.array.isRequired,
  domainID: PropTypes.number.isRequired,
  userID: PropTypes.number.isRequired,
  setUserDelegates: PropTypes.func.isRequired,
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
    fetchPermittedUsers: async (domainID, userID) => await dispatch(fetchPermittedUsers(domainID, userID, {}))
      .catch(err => console.error(err)),
    fetchUsers: async domainID => await dispatch(fetchUsersData(domainID, { limit: 1000000, level: 0 }))
      .catch(err => console.error(err)),
    setUserDelegates: async (domainID, userID, delegates) =>
      await dispatch(setUserDelegates(domainID, userID, delegates))
        .catch(err => console.error(err)),
    setPermittedUserData: async (domainID, folderID, permittedUsers) => {
      await dispatch(setPermittedUserData(domainID, folderID, permittedUsers)).catch(msg => Promise.reject(msg));
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Delegates))));
