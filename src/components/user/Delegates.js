// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent } from 'react';
import { Button, FormControl, Grid, Typography } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { fetchPermittedUsers, fetchUserDelegates, fetchPlainUsersData, setUserDelegates,
  setPermittedUserData } from '../../actions/users';
import { withRouter } from 'react-router';
import Feedback from '../Feedback';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';

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
            <MagnitudeAutocomplete
              multiple
              value={delegates || []}
              filterAttribute={'username'}
              inputValue={delegatesACInput}
              onChange={this.handleAutocomplete('delegates')}
              className={classes.input} 
              options={Users.filter(u => u.ID !== userID) || []}
              onInputChange={this.handleInput('delegatesACInput')}
              label={t('Delegates')}
              placeholder={t("Search users") + "..."}
              getOptionLabel={(delegate) => delegate.username || delegate || ''}
            />
            <MagnitudeAutocomplete
              multiple
              value={permittedUsers || []}
              filterAttribute={'username'}
              inputValue={pUACInput}
              onChange={this.handleAutocomplete('permittedUsers')}
              className={classes.input} 
              options={Users.filter(u => u.ID !== userID) || []}
              onInputChange={this.handleInput('pUACInput')}
              label={t('Full permission users')}
              placeholder={t("Search users") + "..."}
              getOptionLabel={(option) => option.username || option || ''}
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
    fetchUsers: async domainID => await dispatch(fetchPlainUsersData(domainID))
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
