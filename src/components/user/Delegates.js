// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent } from 'react';
import { Button, FormControl, Grid, TextField, Typography, withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Autocomplete } from '@material-ui/lab';
import { fetchUserDelegates, fetchUsersData, setUserDelegates } from '../../actions/users';
import { withRouter } from 'react-router';
import Feedback from '../Feedback';
import { getAutocompleteOptions } from '../../utils';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1),
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
    snackbar: '',
    autocompleteInput: '',
  };

  async componentDidMount() {
    const { fetch, fetchUsers, userID, domainID } = this.props;
    fetchUsers(domainID);
    const delegates = await fetch(domainID, userID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    if(delegates) this.setState({ delegates: delegates.data });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal.map(r => r.username ? r.username : r),
      autocompleteInput: '',
    });
  }

  handleSave = () => {
    const { setUserDelegates, userID, domainID } = this.props;
    setUserDelegates(domainID, userID, this.state.delegates)
      .then(() => this.setState({ snackbar: 'Success!', autocompleteInput: '' }));
  }

  render() {
    const { classes, t, Users, userID, history, disabled } = this.props;
    const { delegates, snackbar, autocompleteInput } = this.state;
    return (
      <>
        <FormControl className={classes.form}>
          <Typography variant="h6" className={classes.headline}>{t('Delegates')}</Typography>
          <FormControl className={classes.input}>
            <Autocomplete
              multiple
              options={Users.filter(u => u.ID !== userID) || []}
              inputValue={autocompleteInput}
              filterOptions={getAutocompleteOptions('username')}
              noOptionsText={autocompleteInput.length < Math.round(Math.log10(Users.length) - 2) ?
                t('Filter more precisely') + '...' : t('No options')}
              value={delegates || []}
              onChange={this.handleAutocomplete('delegates')}
              getOptionLabel={(delegate) => delegate.username || delegate || ''}
              renderOption={(user) => user?.username || user || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Delegates")}
                  placeholder="Search delegates..."
                  className={classes.input}
                  onChange={this.handleInput('autocompleteInput')}
                />
              )}
            />
          </FormControl>
        </FormControl>
        <Grid container className={classes.buttonGrid}>
          <Button
            variant="contained"
            onClick={history.goBack}
            style={{ marginRight: 8 }}
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
  fetch: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  Users: PropTypes.array.isRequired,
  domainID: PropTypes.number.isRequired,
  userID: PropTypes.number.isRequired,
  setUserDelegates: PropTypes.func.isRequired,
  history: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
};

const mapStateToProps = state => {
  return { Users: state.users.Users };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchUserDelegates(domainID, userID))
      .catch(err => console.error(err)),
    fetchUsers: async domainID => await dispatch(fetchUsersData(domainID, { limit: 10000 }))
      .catch(err => console.error(err)),
    setUserDelegates: async (domainID, userID, delegates) =>
      await dispatch(setUserDelegates(domainID, userID, delegates))
        .catch(err => console.error(err)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Delegates))));
