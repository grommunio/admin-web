// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { Fragment, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, 
  Button, DialogActions, List,
  ListItem, ListItemText, ListItemButton, Divider, MenuItem,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { setFolderPermissions } from '../../actions/folders';
import AddOwner from './AddOwner';
import RemoveOwner from './RemoveOwner';
import { permissionProfiles } from '../../mapi/rights';
import { useAppDispatch, useAppSelector } from '../../store';
import { Domain } from '@/types/domains';
import { ChangeEvent } from '@/types/common';
import { Owner } from '@/types/users.js';
import PermissionsGrid from '../PermissionsGrid';


const useStyles = makeStyles()(() => ({
  select: {
    minWidth: 60,
  },
  list: {
    border: '1px solid black',
    marginBottom: 8,
    padding: 0,
    maxHeight: 170,
    overflowY: 'auto',
  },
  addUserRow: {
    marginBottom: 32,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  noOwnersContainer: {
    display: 'flex',
    border: '1px solid black',
    justifyContent: 'center',
    marginBottom: 8,
    padding: 8,
  },
}));


interface IFolderPermissionsProps {
  open: boolean;
  domain: Domain;
  folderID: string;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (err: string) => void;
  folderContainer: string;
}

interface FolderPermissionsState {
  adding: boolean;
  deleting: boolean;
  permissions: number;
  selected: Owner | null;
  snackbar: string;
}

const FolderPermissions = (props: IFolderPermissionsProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const owners = useAppSelector(state => state.folders.Owners);
  const [state, setState] = useState<FolderPermissionsState>({
    adding: false,
    deleting: false,
    permissions: 0,
    selected: null,
    snackbar: "",
  });
  const { open, onCancel, domain, folderID, folderContainer } = props;
  const { permissions, selected, adding, deleting } = state;

  const handleEnter = () => {
    if(owners.length > 0) {
      setState({
        ...state,
        selected: owners[0],
        permissions: owners[0].permissions,
      });
    }
  }

  const handleAdd = () => setState({ ...state, adding: true });

  const handleAddingSuccess = () => setState({ ...state, adding: false });

  const handleAddingError = (error: string) => setState({ ...state, snackbar: error });

  const handleAddingCancel = () => setState({ ...state, adding: false });

  const handleUserSelect = (user: Owner) => () => {
    setState({ ...state, selected: user, permissions: user.permissions });
  }

  const handleSave = () => {
    const { domain, folderID, onSuccess, onError } = props;
    const { selected, permissions } = state;
    if(!selected) return;
    dispatch(setFolderPermissions(domain.ID, folderID, selected.memberID, permissions))
      .then(onSuccess)
      .catch(onError);
  }

  const handleDelete = () => setState({ ...state, deleting: true });

  const handleDeleteClose = () => setState({ ...state, deleting: false });

  const handleDeleteSuccess = () => {
    setState({ ...state, deleting: false, snackbar: 'Success!' });
  }

  const handleDeleteError = (error: string) => setState({ ...state, snackbar: error });

  const handleProfileSelect = (e: ChangeEvent) =>
    setState({ ...state, permissions: parseInt(e.target.value) });

  return (
    (<Dialog
      onClose={onCancel}
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{
        transition: {
          onEnter: handleEnter
        }
      }}
    >
      <DialogTitle>{t('Permissions')}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        {owners.length > 0 ? <List className={classes.list}>
          {owners.map((user: Owner, idx: number) => <Fragment key={idx}>
            <ListItem disablePadding>
              <ListItemButton
                selected={user.memberID === selected?.memberID}
                component="a"
                onClick={handleUserSelect(user)}
              >
                <ListItemText primary={user.username}/>
              </ListItemButton>
            </ListItem> 
            <Divider />
          </Fragment>)}
        </List> : <div className={classes.noOwnersContainer}>
          <em>{t('No owners')}</em>
        </div>}
        <div className={classes.addUserRow}>
          <Button
            onClick={handleAdd}
            variant="contained"
            color="primary"
            style={{ marginRight: 8 }}
          >
            {t('Add')}
          </Button>
          <Button
            onClick={handleDelete}
            color="secondary"
          >
            {t('Remove')}
          </Button>
        </div>
        <TextField
          fullWidth
          sx={{ mb: 1 }}
          label={t('Profile')}
          value={permissionProfiles.findIndex(profile => profile.value === permissions) === -1 ? "" : permissions}
          onChange={handleProfileSelect}
          select
        >
          {permissionProfiles.map((profile, idx) =>
            <MenuItem key={idx} value={profile.value}>
              {t(profile.name)}
            </MenuItem>
          )}
        </TextField>
        <PermissionsGrid
          permissions={permissions}
          setPermissions={(permissions: number) => setState({...state, permissions})}
          isCalendarFolder={folderContainer === "IPF.Appointment"}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          color="secondary"
        >
          {t('Close')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={owners.length === 0 || !selected}
        >
          {t('Save')}
        </Button>
      </DialogActions>
      <AddOwner
        open={adding}
        onSuccess={handleAddingSuccess}
        onError={handleAddingError}
        onCancel={handleAddingCancel}
        domain={domain}
        folderID={folderID}
      />
      {selected && <RemoveOwner
        open={deleting}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        ownerName={selected.username}
        domainID={domain.ID}
        folderID={folderID}
        memberID={selected.memberID}
      />}
    </Dialog>)
  );
}


export default FolderPermissions;
