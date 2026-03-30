// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid2,
  TextField,
  FormControl,
  Button,
  MenuItem,
  IconButton,
  Theme,
} from '@mui/material';
import { fetchAllUsers } from '../actions/users';
import Add from '@mui/icons-material/AddCircle';
import Delete from '@mui/icons-material/Delete';
import { fetchPermissionsData, editRoleData, fetchRoleData } from '../actions/roles';
import { getStringAfterLastSlash } from '../utils';
import { fetchDomainData } from '../actions/domains';
import { fetchOrgsData } from '../actions/orgs';
import { ORG_ADMIN, SYSTEM_ADMIN_WRITE, USER_STATUS } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store';
import { Permission, UpdateRole } from '@/types/roles';
import { ChangeEvent } from '@/types/common';
import { User } from '@/types/users';


const useStyles = makeStyles()((theme: Theme) => ({
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
}));


const RoleDetails = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Users } = useAppSelector(state => state.users);
  const { Permissions } = useAppSelector(state => state.roles);
  const { Domains } = useAppSelector(state => state.domains);
  const { Orgs } = useAppSelector(state => state.orgs);
  const [state, setState] = useState({
    role: {
      ID: 0,
      name: "",
      description: "",
      users: [],
      permissions: [],
    },
    snackbar: '',
    loading: true,
    unsaved: false,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const edit = async (role: UpdateRole) => await dispatch(editRoleData(role));
  const fetchUser = async () => await dispatch(fetchAllUsers({ sort: 'username,asc', limit: 1000000, status: USER_STATUS.NORMAL }));
  const fetchDomains = async () => await dispatch(fetchDomainData({ limit: 1000000, level: 0, sort: 'domainname,asc'}));
  const fetchPermissions = async () => await dispatch(fetchPermissionsData());
  const fetchOrgs = async () => await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }));
  const fetch = async (id: number) => await dispatch(fetchRoleData(id));

  useEffect(() => {
    const inner = async () => {
      await fetchDomains().catch(err => setState({ ...state, snackbar: err }));
      await fetchOrgs().catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
      await fetchPermissions().catch(err => setState({ ...state, snackbar: err }));
      await fetchUser().catch(err => setState({ ...state, snackbar: err }));
      const role = await fetch(parseInt(getStringAfterLastSlash()));
      setState({ ...state, role, loading: false });
    };

    inner();
  }, []);

  const handleRoleInput = (field: string) => (event: ChangeEvent) => {
    setState({
      ...state, 
      role: {
        ...state.role,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  const handleAutocomplete = (field: string) => (_: never, newVal: User) => {
    setState({
      ...state, 
      role: {
        ...state.role,
        [field]: newVal,
      },
      unsaved: true,
    });
  }

  const handleEdit = () => {
    const { role } = state;
    edit({
      ...role,
      users: role.users.map(user => user.ID),
      permissions: role.permissions.map(perm => ({
        ...perm,
        params: perm.params?.ID ? perm.params.ID : perm.params, // If params have not been edited, send the ID
      })),
    })
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const handleSelectPermission = (idx: number) => (event: ChangeEvent) => {
    const copy = [...state.role.permissions];
    const input = event.target.value as Permission;
    copy[idx].permission = input;
    copy[idx].ID = undefined;
    copy[idx].params = '';
    setState({
      ...state, 
      role: {
        ...state.role,
        permissions: copy,
      },
    });
  }

  // Fix typing
  const handleSetParams = (idx: number) => (_: never, newVal: any) => {
    const copy = [...state.role.permissions];
    copy[idx].params = newVal;
    setState({
      ...state, 
      role: {
        ...state.role,
        permissions: copy,
      },
    });
  }

  const handleNewRow = () => {
    const copy = [...state.role.permissions];
    copy.push({ permission: '', params: '' });
    setState({
      ...state, 
      role: {
        ...state.role,
        permissions: copy,
      },
    });
  }

  const removeRow = (idx: number) => () => {
    const copy = [...state.role.permissions];
    copy.splice(idx, 1);
    setState({
      ...state, 
      role: {
        ...state.role,
        permissions: copy,
      },
    });
  }

  /**
   * Checks if all permissions have proper parameters.
   * @returns boolean, if all permissions are set properly
   */
  const checkProperPermissions = () => {
    const { permissions } = state.role;
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

  const { loading, snackbar, role } = state;
  const { name, description, users, permissions } = role;
  const domains = [{ ID: '*', domainname: 'All' }].concat(Domains);
  const orgs = [{ ID: '*', name: 'All' }].concat(Orgs);
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  return (
    <ViewWrapper
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
    >
      <Paper className={classes.paper} elevation={1}>
        <Grid2 container>
          <Typography
            color="primary"
            variant="h5"
          >
            {t('editHeadline', { item: 'Role' })}
          </Typography>
        </Grid2>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Name")} 
            fullWidth
            autoFocus
            value={name || ''}
            onChange={handleRoleInput('name')}
          />
          <TextField 
            className={classes.input} 
            label={t("Description")} 
            fullWidth
            multiline
            variant="outlined"
            rows={4}
            value={description || ''}
            onChange={handleRoleInput('description')}
          />
          <MagnitudeAutocomplete
            multiple
            value={users || []}
            filterAttribute={'username'}
            onChange={handleAutocomplete('users')}
            className={classes.input} 
            options={Users || []}
            label={t('Users')}
            placeholder={t("Search users") + "..."}
            getOptionKey={(option) => `${option.ID}_${option.domainID}`}
            isOptionEqualToValue={(option, value) => option.ID === value.ID && option.domainID === value.domainID}
          />
          {(permissions || []).map((permission, idx) =>
            <div key={idx} className={classes.row}>
              <TextField
                select
                label={t("Permission")}
                value={permission.permission || ''}
                onChange={handleSelectPermission(idx)}
                fullWidth
                variant="standard"
              >
                {Permissions.map((name: Permission) => (
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
                onChange={handleSetParams(idx)}
                className={classes.rowTextfield} 
                options={domains || []}
                label={t('Params')}
                placeholder={t("Search domains") + "..."}
                variant="standard"
                fullWidth
                autoSelect
                isOptionEqualToValue={(option, value) => option.ID === value.ID}
              />}
              {permission.permission === ORG_ADMIN && <MagnitudeAutocomplete
                value={permission.params}
                getOptionLabel={(orgID) => orgID.name ||
                    (orgs || []).find(o => o.ID === orgID)?.name || ''} // Because only ID is received
                filterAttribute={'name'}
                onChange={handleSetParams(idx)}
                className={classes.rowTextfield} 
                options={orgs || []}
                label={t('Params')}
                placeholder={t("Search organizations") + "..."}
                variant="standard"
                fullWidth
                autoSelect
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
        </FormControl>
        <Button
          color="secondary"
          onClick={() => navigate('/roles')}
          style={{ marginRight: 8 }}
        >
          {t('Back')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEdit}
          disabled={!writable
              || !name
              || permissions.length === 0
              || !checkProperPermissions()}
        >
          {t('Save')}
        </Button>
      </Paper>
    </ViewWrapper>
  );
}


export default RoleDetails;
