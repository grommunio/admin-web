// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, Grid, IconButton, 
} from '@material-ui/core';
import Delete from '@material-ui/icons/Close';
import Add from '@material-ui/icons/AddCircle';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { fetchDomainData } from '../../actions/domains';
import { fetchAllUsers } from '../../actions/users';
import { addRolesData, fetchPermissionsData } from '../../actions/roles';
import { fetchOrgsData } from '../../actions/orgs';
import { Autocomplete } from '@material-ui/lab';

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
  rowTextfield: {
    margin: theme.spacing(0, 1, 0, 1),
  },
  row: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  addButton: {
    marginTop: 8,
  },
});

class AddRole extends PureComponent {

  state = {
    name: '',
    description: '',
    permissions: [{ permission: '', params: '' }],
    users: [],
    loading: false,
  }

  componentDidMount() {
    const { fetch, fetchDomains, fetchUsers, fetchOrgs } = this.props;
    fetch()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
    fetchDomains()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
    fetchUsers()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
    fetchOrgs()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleCheckbox = field => event => this.setState({
    [field]: event.target.checked,
  });

  handleAdd = () => {
    const { add, onSuccess, onError } = this.props;
    const { users, permissions } = this.state;
    this.setState({ loading: true });
    add({
      ...this.state,
      loading: undefined,
      users: users.map(u => u.ID),
      permissions: permissions.map(permission => {
        const params = permission.params;
        return {
          ...permission,
          params: params.ID,
        };
      }),
    })
      .then(() => {
        this.setState({
          name: '',
          description: '',
          permissions: [{ permission: '', params: '' }],
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
    });
  }

  handleSelectPermission = idx => event => {
    const copy = [...this.state.permissions];
    const input = event.target.value;
    copy[idx].permission = input;
    if(input === 'SystemAdmin') {
      copy[idx].params = '';
    }
    this.setState({ permissions: copy });
  }

  handleSetParams = idx => (e, newVal) => {
    const copy = [...this.state.permissions];
    copy[idx].params = newVal;
    this.setState({ permissions: copy });
  }

  handleNewRow = () => {
    const copy = [...this.state.permissions];
    copy.push({ permission: '', params: '' });
    this.setState({ permissions: copy });
  }

  removeRow = idx => () => {
    const copy = [...this.state.permissions];
    copy.splice(idx, 1);
    this.setState({ permissions: copy });
  }

  render() {
    const { classes, t, open, onSuccess, Permissions, Domains, Users, Orgs } = this.props;
    const { name, permissions, description, loading, users } = this.state;
    const domains = [{ ID: '*', domainname: 'All'}].concat(Domains);
    const orgs = [{ ID: '*', name: 'All'}].concat(Orgs);
    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'Role' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              label={t("Name")}
              value={name}
              onChange={this.handleInput('name')}
              className={classes.input}
              autoFocus
              required
            />
            <Autocomplete
              multiple
              options={Users || []}
              value={users || []}
              onChange={this.handleAutocomplete('users')}
              getOptionLabel={(user) => user.username || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Users"
                  placeholder="Search users..."
                  className={classes.input} 
                />
              )}
            />
            {permissions.map((permission, idx) =>
              <div key={idx} className={classes.row}>
                <TextField
                  select
                  label={t("Permission")}
                  value={permission.permission || ''}
                  onChange={this.handleSelectPermission(idx)}
                  fullWidth
                >
                  {Permissions.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </TextField>
                {permission.permission === 'DomainAdmin' && <Autocomplete
                  options={domains || []}
                  value={permission.params}
                  onChange={this.handleSetParams(idx)}
                  getOptionLabel={(domain) => domain.domainname || ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Params"
                      placeholder="Search domains..."
                    />
                  )}
                  className={classes.rowTextfield}
                  fullWidth
                  autoSelect
                />}
                {permission.permission === 'OrgAdmin' && <Autocomplete
                  options={orgs || []}
                  value={permission.params}
                  onChange={this.handleSetParams(idx)}
                  getOptionLabel={(org) => org.name || ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Params"
                      placeholder="Search organizations..."
                    />
                  )}
                  className={classes.rowTextfield}
                  fullWidth
                  autoSelect
                />}
                <IconButton size="small" onClick={this.removeRow(idx)}>
                  <Delete fontSize="small" color="error" />
                </IconButton>
              </div>
            )}
            <Grid container justify="center" className={classes.addButton}>
              <Button size="small" onClick={this.handleNewRow}>
                <Add color="primary" />
              </Button>
            </Grid>
            <TextField 
              className={classes.input} 
              label={t("Description")} 
              fullWidth
              multiline
              variant="outlined"
              rows={4}
              value={description}
              onChange={this.handleInput('description')}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onSuccess}
            variant="contained"
          >
            Cancel
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={!name || loading || permissions.length === 0 || !permissions[0].permission}
          >
            {loading ? <CircularProgress size={24}/> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddRole.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  Permissions: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  Domains: PropTypes.array.isRequired,
  Orgs: PropTypes.array.isRequired,
  Users: PropTypes.array.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  fetchOrgs: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Permissions: state.roles.Permissions,
    Domains: state.domains.Domains,
    Users: state.users.Users,
    Orgs: state.orgs.Orgs,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchPermissionsData({})).catch(err => Promise.reject(err));
    },
    fetchDomains: async () => await dispatch(fetchDomainData({ limit: 5000, level: 0 }))
      .catch(err => Promise.reject(err)),
    fetchUsers: async () => await dispatch(fetchAllUsers({ sort: 'username,asc', limit: 5000, level: 0 }))
      .catch(err => Promise.reject(err)),
    fetchOrgs: async () => await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 5000, level: 0 }))
      .catch(err => Promise.reject(err)),
    add: async role => {
      await dispatch(addRolesData(role)).catch(err => Promise.reject(err));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddRole)));
