// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, Grid2, IconButton, 
} from '@mui/material';
import Delete from '@mui/icons-material/Close';
import Add from '@mui/icons-material/AddCircle';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { fetchDomainData } from '../../actions/domains';
import { fetchAllUsers } from '../../actions/users';
import { addRolesData, fetchPermissionsData } from '../../actions/roles';
import { fetchOrgsData } from '../../actions/orgs';
import { ORG_ADMIN } from '../../constants';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';

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
    marginLeft: 8,
    display: 'flex',
    alignItems: 'flex-end',
  },
  addButton: {
    marginTop: 8,
  },
});

const AddRole = props => {
  const [role, setRole] = useState({
    name: '',
    description: '',
    permissions: [{ permission: '', params: '' }],
    users: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { fetch, fetchDomains, fetchUsers, fetchOrgs } = props;
    fetch()
      .catch(msg => {
        setRole({ snackbar: msg || 'Unknown error' });
      });
    fetchDomains()
      .catch(msg => {
        setRole({ snackbar: msg || 'Unknown error' });
      });
    fetchUsers()
      .catch(msg => {
        setRole({ snackbar: msg || 'Unknown error' });
      });
    fetchOrgs()
      .catch(msg => {
        setRole({ snackbar: msg || 'Unknown error' });
      });
  }, []);

  const handleInput = field => event => {
    setRole({
      ...role,
      [field]: event.target.value,
    });
  }

  const handleAdd = e => {
    e.preventDefault();
    const { add, onSuccess, onError } = props;
    const { users, permissions } = role;
    setLoading(true);
    add({
      ...role,
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
        setRole({
          name: '',
          description: '',
          permissions: [{ permission: '', params: '' }],
        });
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAutocomplete = (field) => (e, newVal) => {
    setRole({
      ...role,
      [field]: newVal,
    });
  }

  const handleSelectPermission = idx => event => {
    const copy = [...role.permissions];
    const input = event.target.value;
    copy[idx].permission = input;
    if(input === 'SystemAdmin') {
      copy[idx].params = '';
    }
    setRole({ ...role, permissions: copy });
  }

  const handleSetParams = idx => (e, newVal) => {
    const copy = [...role.permissions];
    copy[idx].params = newVal;
    setRole({ ...role, permissions: copy });
  }

  const handleNewRow = () => {
    const copy = [...role.permissions];
    copy.push({ permission: '', params: '' });
    setRole({ ...role, permissions: copy });
  }

  const removeRow = idx => () => {
    const copy = [...role.permissions];
    copy.splice(idx, 1);
    setRole({ ...role, permissions: copy });
  }

  const checkProperPermissions = () => {
    const { permissions } = role;
    const every = permissions.every(p => {
      if(!p.permission) return false;
      if(["SystemAdmin", "SystemAdminRO", "DomainPurge", "ResetPasswd"].includes(p.permission)) {
        return true;
      }
      if(!p.params) return false;
      return true;
    });
    return every;
  }

  const { classes, t, open, onClose, Permissions, Users, Domains, Orgs } = props;
  const { name, permissions, description, users } = role;
  const orgs = [{ ID: '*', name: 'All'}].concat(Orgs);
  const domains = [{ ID: '*', domainname: 'All'}].concat(Domains);

  return (
    <Dialog
      onClose={onClose}
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
            onChange={handleInput('name')}
            className={classes.input}
            autoFocus
            required
          />
          <MagnitudeAutocomplete
            multiple
            value={users || []}
            filterAttribute={'username'}
            onChange={handleAutocomplete('users')}
            className={classes.input} 
            options={Users || []}
            label={t('Users')}
            placeholder={t("Search users") +  "..."}
            isOptionEqualToValue={(option, value) => option.ID === value.ID && option.domainID === value.domainID}
            getOptionKey={(option) => `${option.ID}_${option.domainID}`}
          />
          {permissions.map((permission, idx) =>
            <div key={idx} className={classes.row}>
              <TextField
                select
                label={t("Permission")}
                value={permission.permission || ''}
                onChange={handleSelectPermission(idx)}
                fullWidth
                variant="standard"
              >
                {Permissions.map((name, key) => (
                  <MenuItem key={key} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
              {permission.permission.includes('DomainAdmin') /*Read and Write*/ && 
                <MagnitudeAutocomplete
                  value={permission.params}
                  filterAttribute={'domainname'}
                  onChange={handleSetParams(idx)}
                  className={classes.rowTextfield} 
                  options={domains || []}
                  label={t('Params')}
                  placeholder={t('Search domains') + "..."}
                  variant="standard"
                  autoSelect
                  fullWidth
                  isOptionEqualToValue={(option, value) => option.ID === value.ID}
                />}
              {permission.permission === ORG_ADMIN /*Read and Write*/ && 
                <MagnitudeAutocomplete
                  value={permission.params}
                  filterAttribute={'name'}
                  onChange={handleSetParams(idx)}
                  className={classes.rowTextfield} 
                  options={orgs || []}
                  label={t('Params')}
                  placeholder={t('Search organizations') + "..."}
                  variant="standard"
                  autoSelect
                  fullWidth
                  isOptionEqualToValue={(option, value) => option.ID === value.ID}
                />}
              <IconButton size="small" onClick={removeRow(idx)}>
                <Delete fontSize="small" color="error" />
              </IconButton>
            </div>
          )}
          <Grid2 container justifyContent="center" className={classes.addButton}>
            <Button size="small" onClick={handleNewRow}>
              <Add color="primary" />
            </Button>
          </Grid2>
          <TextField 
            className={classes.input} 
            label={t("Description")} 
            fullWidth
            multiline
            variant="outlined"
            rows={4}
            value={description}
            onChange={handleInput('description')}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={!name
              || loading
              || permissions.length === 0
              || !checkProperPermissions()
          }
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddRole.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  Permissions: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
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
    fetchDomains: async () => await dispatch(fetchDomainData({ limit: 1000000, level: 0 }))
      .catch(err => Promise.reject(err)),
    fetchUsers: async () => await dispatch(fetchAllUsers({ sort: 'username,asc', limit: 1000000, status: 0 }))
      .catch(err => Promise.reject(err)),
    fetchOrgs: async () => await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }))
      .catch(err => Promise.reject(err)),
    add: async role => {
      await dispatch(addRolesData(role)).catch(err => Promise.reject(err));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(AddRole, styles)));
