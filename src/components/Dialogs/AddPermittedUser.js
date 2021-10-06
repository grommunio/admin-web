// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  Button, DialogActions, CircularProgress, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addPermittedUserData } from '../../actions/users';
import { fetchUsersData } from '../../actions/users';
import { Autocomplete } from '@material-ui/lab';
import { getAutocompleteOptions } from '../../utils';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
});

class AddPermittedUser extends PureComponent {

  state = {
    permittedUser: '',
    id: -1,
    loading: false,
  }

  componentDidMount() {
    const { fetchUsers, domainID } = this.props;
    fetchUsers(domainID)
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleAdd = () => {
    const { add, onSuccess, onError, domainID, userID } = this.props;
    const { permittedUser, id } = this.state;
    this.setState({ loading: true });
    add(domainID, userID, { username: permittedUser })
      .then(() => {
        this.setState({
          permittedUser: '',
          autocompleteInput: '',
          loading: false,
        });
        onSuccess({ ID: id, displayName: permittedUser});
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal?.username || '',
      id: newVal?.ID || -1,
    });
  }

  render() {
    const { classes, t, open, onClose, Users } = this.props;
    const { permittedUser, loading } = this.state;
    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'Owner' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <Autocomplete
              inputValue={permittedUser}
              filterOptions={getAutocompleteOptions('username')}
              noOptionsText={permittedUser.length < Math.round(Math.log10(Users.length) - 2) ?
                t('Filter more precisely') + '...' : t('No options')}
              options={Users || []}
              value={permittedUser || ''}
              onChange={this.handleAutocomplete('permittedUser')}
              getOptionLabel={(user) => user.username || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Permitted users"
                  placeholder="Search users..."
                  className={classes.input}
                  onChange={this.handleInput('permittedUser')}
                />
              )}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            variant="contained"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={!permittedUser || loading}
          >
            {loading ? <CircularProgress size={24}/> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddPermittedUser.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domainID: PropTypes.number.isRequired,
  userID: PropTypes.number.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  Users: PropTypes.array.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  return {
    Users: state.users.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, folderID, permittedUser) => {
      await dispatch(addPermittedUserData(domainID, folderID, permittedUser)).catch(msg => Promise.reject(msg));
    },
    fetchUsers: async domainID => {
      await dispatch(fetchUsersData(domainID, { sort: 'username,asc', limit: 1000000, level: 0 }))
        .catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddPermittedUser)));
