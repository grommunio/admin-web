// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, Grid2, IconButton,
  Theme, 
} from '@mui/material';
import Delete from '@mui/icons-material/Close';
import Add from '@mui/icons-material/AddCircle';
import { useTranslation } from 'react-i18next';
import { fetchDomainData } from '../../actions/domains';
import { fetchAllUsers } from '../../actions/users';
import { addRolesData, fetchPermissionsData } from '../../actions/roles';
import { fetchOrgsData } from '../../actions/orgs';
import { ORG_ADMIN } from '../../constants';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { useAppDispatch, useAppSelector } from '../../store';
import { NewRole, Permission } from '@/types/roles';
import { User } from '@/types/users';
import { ChangeEvent } from '@/types/common';


const useStyles = makeStyles()((theme: Theme) => ({
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


type AddRoleProps = {
  open: boolean;
  onClose: () => void;
  onError: (error: string) => void;
  onSuccess: () => void;
}


const AddRole = (props: AddRoleProps) => {
  const { open, onClose, onSuccess, onError } = props;
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Permissions } = useAppSelector(state => state.roles);
  const { Users } = useAppSelector(state => state.users);
  const { Domains } = useAppSelector(state => state.domains);
  const { Orgs } = useAppSelector(state => state.orgs);
  const [role, setRole] = useState({
    name: '',
    description: '',
    permissions: [{ permission: '', params: null }],
    users: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchPermissionsData()).catch(err => Promise.reject(err));
    dispatch(fetchDomainData({ limit: 1000000, level: 0, sort: 'domainname,asc' }))
      .catch(err => Promise.reject(err));
    dispatch(fetchAllUsers({ sort: 'username,asc', limit: 1000000, status: 0 }))
      .catch(err => Promise.reject(err));
    dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }))
      .catch(err => Promise.reject(err));
  }, []);

  const handleInput = (field: keyof NewRole) => (event: ChangeEvent) => {
    setRole({
      ...role,
      [field]: event.target.value,
    });
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const { users, permissions } = role;
    setLoading(true);
    dispatch(addRolesData({
      ...role,
      users: users.map(u => u.ID),
      permissions: permissions.map(permission => {
        const params = permission.params;
        return {
          permission: permission.permission as Permission,
          params: params ? params.ID : "",
        };
      }),
    }))
      .then(() => {
        setRole({
          ...role,
          name: '',
          description: '',
          permissions: [{ permission: '', params: null }],
        });
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAutocomplete = (field: keyof NewRole) => (_: never, newVal: User) => {
    setRole({
      ...role,
      [field]: newVal,
    });
  }

  const handleSelectPermission = (idx: number) => (event: ChangeEvent) => {
    const copy = [...role.permissions];
    const input = event.target.value;
    copy[idx].permission = input;
    if(input === 'SystemAdmin') {
      copy[idx].params = '';
    }
    setRole({ ...role, permissions: copy });
  }

  const handleSetParams = (idx: number) => (_: never, newVal: { ID: number, domainname?: string, name?: string }) => {
    const copy = [...role.permissions];
    copy[idx].params = newVal;
    setRole({ ...role, permissions: copy });
  }

  const handleNewRow = () => {
    const copy = [...role.permissions];
    copy.push({ permission: '', params: '' });
    setRole({ ...role, permissions: copy });
  }

  const removeRow = (idx: number) => () => {
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
                {Permissions.map((name: string, key: number) => (
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



export default AddRole;