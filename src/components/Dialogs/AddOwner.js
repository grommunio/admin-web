// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addOwnerData } from '../../actions/folders';
import { fetchUsersData } from '../../actions/users';
import { Autocomplete } from '@mui/lab';
import { getAutocompleteOptions } from '../../utils';

const styles = theme => ({
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
});

class AddOwner extends PureComponent {

  state = {
    owners: [],
    loading: false,
    autocompleteInput: '',
  }

  componentDidMount() {
    const { fetchUsers, domain } = this.props;
    fetchUsers(domain.ID)
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
    const { add, onSuccess, onError, domain, folderID } = this.props;
    this.setState({ loading: true });
    add(domain.ID, folderID, this.state.owners)
      .then(() => {
        this.setState({
          owners: [],
          autocompleteInput: '',
          loading: false,
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal,
      autocompleteInput: '',
    });
  }

  render() {
    const { classes, t, open, onSuccess, Users } = this.props;
    const { owners, loading, autocompleteInput } = this.state;
    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'Owner' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <Autocomplete
              multiple
              inputValue={autocompleteInput}
              filterOptions={getAutocompleteOptions('username')}
              noOptionsText={autocompleteInput.length < Math.round(Math.log10(Users.length) - 2) ?
                t('Filter more precisely') + '...' : t('No options')}
              options={Users || []}
              value={owners || []}
              onChange={this.handleAutocomplete('owners')}
              getOptionLabel={(user) => user.username || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Owners"
                  placeholder="Search users..."
                  className={classes.input}
                  onChange={this.handleInput('autocompleteInput')}
                />
              )}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onSuccess}
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={owners.length === 0 || loading}
          >
            {loading ? <CircularProgress size={24}/> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddOwner.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  Users: PropTypes.array.isRequired,
  folderID: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
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
    add: async (domainID, folderID, owners) => {
      await dispatch(addOwnerData(domainID, folderID, owners)).catch(msg => Promise.reject(msg));
    },
    fetchUsers: async domainID => {
      await dispatch(fetchUsersData(domainID, { sort: 'username,asc', limit: 1000000, level: 0 }))
        .catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddOwner)));
