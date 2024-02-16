// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  MenuItem,
  IconButton,
} from '@mui/material';
import { fetchAllUsers } from '../actions/users';
import { connect } from 'react-redux';
import Add from '@mui/icons-material/AddCircle';
import Delete from '@mui/icons-material/Delete';
import { fetchPermissionsData, editRoleData, fetchRoleData } from '../actions/roles';
import { getStringAfterLastSlash } from '../utils';
import { fetchDomainData } from '../actions/domains';
import { fetchOrgsData } from '../actions/orgs';
import { ORG_ADMIN, SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
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
  rowTextfield: {
    margin: theme.spacing(0, 1, 0, 1),
  },
  row: {
    marginLeft: 8,
    display: 'flex',
    alignItems: 'flex-end',
  },
  addButton: {
    marginTop: 8,
  },
});

class RoleDetails extends PureComponent {

  state = {
    role: {
      users: [],
      permissions: [],
    },
    autocompleteInput: '',
    snackbar: '',
    loading: true,
  };


  async componentDidMount() {
    const { fetch, fetchUser, fetchDomains, fetchPermissions, fetchOrgs } = this.props;
    await fetchDomains().catch(err => this.setState({ snackbar: err }));
    await fetchOrgs().catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    await fetchPermissions().catch(err => this.setState({ snackbar: err }));
    await fetchUser().catch(err => this.setState({ snackbar: err }));
    const role = await fetch(getStringAfterLastSlash());
    this.setState({ role, loading: false });
  }

  handleRoleInput = field => event => {
    this.setState({
      role: {
        ...this.state.role,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      role: {
        ...this.state.role,
        [field]: newVal,
      },
      unsaved: true,
      autocompleteInput: '',
    });
  }

  handleEdit = () => {
    const { role } = this.state;
    this.props.edit({
      ...role,
      users: role.users.map(user => user.ID),
      permissions: role.permissions.map(perm => ({
        ...perm,
        params: perm.params?.ID ? perm.params.ID : perm.params, // If params have not been edited, send the ID
        autocompleteInput: undefined,
      })),
    })
      .then(() => this.setState({ snackbar: 'Success!', autocompleteInput: '' }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleSelectPermission = idx => event => {
    const copy = [...this.state.role.permissions];
    const input = event.target.value;
    copy[idx].permission = input;
    copy[idx].ID = undefined;
    copy[idx].params = '';
    copy[idx].autocompleteInput = '';
    this.setState({
      role: {
        ...this.state.role,
        permissions: copy,
      },
    });
  }

  handleSetParams = (idx, attribute) => (e, newVal) => {
    const copy = [...this.state.role.permissions];
    copy[idx].params = newVal;
    copy[idx].autocompleteInput = newVal ? newVal[attribute || "domainname"] : '';
    this.setState({
      role: {
        ...this.state.role,
        permissions: copy,
      },
    });
  }

  handleAutocompleteInput = idx => e => {
    const copy = [...this.state.role.permissions];
    copy[idx].autocompleteInput = e.target.value;
    this.setState({
      role: {
        ...this.state.role,
        permissions: copy,
      },
    });
  }

  handleNewRow = () => {
    const copy = [...this.state.role.permissions];
    copy.push({ permission: '', params: '', autocompleteInput: '' });
    this.setState({
      role: {
        ...this.state.role,
        permissions: copy,
      },
    });
  }

  removeRow = idx => () => {
    const copy = [...this.state.role.permissions];
    copy.splice(idx, 1);
    this.setState({
      role: {
        ...this.state.role,
        permissions: copy,
      },
    });
  }

  /**
   * Checks if all permissions have proper parameters.
   * @returns boolean, if all permissions are set properly
   */
  checkProperPermissions = () => {
    const { permissions } = this.state.role;
    const every = permissions.every(p => {
      if(!p.permission) return false;
      if(["SystemAdmin", "SystemAdminRO", "DomainPurge"].includes(p.permission)) {
        return true;
      }
      if(!p.params) return false;
      return true;
    });
    return every;
  }

  render() {
    const { classes, t, Users, Permissions, Domains, Orgs } = this.props;
    const { loading, snackbar, role, autocompleteInput } = this.state;
    const { name, description, users, permissions } = role;
    const domains = [{ ID: '*', domainname: 'All'}].concat(Domains);
    const orgs = [{ ID: '*', name: 'All'}].concat(Orgs);
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    return (
      <ViewWrapper
        topbarTitle={t('Role')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
        loading={loading}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Role' })}
            </Typography>
          </Grid>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Name")} 
              fullWidth
              autoFocus
              value={name || ''}
              onChange={this.handleRoleInput('name')}
            />
            <TextField 
              className={classes.input} 
              label={t("Description")} 
              fullWidth
              multiline
              variant="outlined"
              rows={4}
              value={description || ''}
              onChange={this.handleRoleInput('description')}
            />
            <MagnitudeAutocomplete
              multiple
              inputValue={autocompleteInput}
              value={users || []}
              filterAttribute={'username'}
              onChange={this.handleAutocomplete('users')}
              onInputChange={this.handleInput('autocompleteInput')}
              className={classes.input} 
              options={Users || []}
              label={t('Users')}
              placeholder={t("Search users") + "..."}
              isOptionEqualToValue={(option, value) => option.ID === value.ID}
            />
            {(permissions || []).map((permission, idx) =>
              <div key={idx} className={classes.row}>
                <TextField
                  select
                  label={t("Permission")}
                  value={permission.permission || ''}
                  onChange={this.handleSelectPermission(idx)}
                  fullWidth
                  variant="standard"
                >
                  {Permissions.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </TextField>
                {permission.permission.includes('DomainAdmin') /*Read and Write*/ && <MagnitudeAutocomplete
                  value={permission.params}
                  getOptionLabel={(domainID) => domainID.domainname ||
                    (domains || []).find(d => d.ID === domainID)?.domainname || ''}
                  filterAttribute={'domainname'}
                  onChange={this.handleSetParams(idx, "domainname")}
                  inputValue={permission.autocompleteInput}
                  onInputChange={this.handleAutocompleteInput(idx)}
                  className={classes.rowTextfield} 
                  options={domains || []}
                  label={t('Params')}
                  placeholder={t("Search domains") + "..."}
                  variant="standard"
                  fullWidth
                  autoSelect
                />}
                {permission.permission === ORG_ADMIN && <MagnitudeAutocomplete
                  value={permission.params}
                  getOptionLabel={(orgID) => orgID.name ||
                    (orgs || []).find(o => o.ID === orgID)?.name || ''} // Because only ID is received
                  filterAttribute={'name'}
                  onChange={this.handleSetParams(idx, "name")}
                  inputValue={permission.autocompleteInput}
                  onInputChange={this.handleAutocompleteInput(idx)}
                  className={classes.rowTextfield} 
                  options={orgs || []}
                  label={t('Params')}
                  placeholder={t("Search organizations") + "..."}
                  variant="standard"
                  fullWidth
                  autoSelect
                />}
                <IconButton size="small" onClick={this.removeRow(idx)}>
                  <Delete fontSize="small" color="error" />
                </IconButton>
              </div>
            )}
            <Grid container justifyContent="center" className={classes.addButton}>
              <Button size="small" onClick={this.handleNewRow}>
                <Add color="primary" />
              </Button>
            </Grid>
          </FormControl>
          <Button
            color="secondary"
            onClick={() => this.props.history.push('/roles')}
            style={{ marginRight: 8 }}
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleEdit}
            disabled={!writable
              || !name
              || permissions.length === 0
              || !this.checkProperPermissions()}
          >
            {t('Save')}
          </Button>
        </Paper>
      </ViewWrapper>
    );
  }
}

RoleDetails.contextType = CapabilityContext;
RoleDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchUser: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  fetchPermissions: PropTypes.func.isRequired,
  fetchOrgs: PropTypes.func.isRequired,
  Users: PropTypes.array.isRequired,
  Permissions: PropTypes.array.isRequired,
  Domains: PropTypes.array.isRequired,
  Orgs: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    Users: state.users.Users,
    Permissions: state.roles.Permissions,
    Domains: state.domains.Domains,
    Orgs: state.orgs.Orgs,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async role => {
      await dispatch(editRoleData(role)).catch(message => Promise.reject(message));
    },
    fetchUser: async () => {
      await dispatch(fetchAllUsers({ sort: 'username,asc', limit: 1000000 }))
        .catch(message => Promise.reject(message));
    },
    fetchDomains: async () => {
      await dispatch(fetchDomainData({ limit: 1000000, level: 0 })).catch(message => Promise.reject(message));
    },
    fetchPermissions: async () => {
      await dispatch(fetchPermissionsData({})).catch(message => Promise.reject(message));
    },
    fetchOrgs: async () => await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }))
      .catch(err => Promise.reject(err)),
    fetch: async id => await dispatch(fetchRoleData(id))
      .then(role => role)
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(RoleDetails)));
