// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { Fragment, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl,
  Button, DialogActions, Grid2, FormLabel, RadioGroup, Radio, FormControlLabel, Checkbox, List,
  ListItem, ListItemText, ListItemButton, Divider, MenuItem, InputLabel, Select,
  Theme,
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


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
  radio: {
    padding: '2px 9px',
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


type FolderPermissionsProps = {
  open: boolean;
  domain: Domain;
  folderID: string;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (err: string) => void;
}

const FolderPermissions = (props: FolderPermissionsProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const owners = useAppSelector(state => state.folders.Owners);
  const [state, setState] = useState({
    adding: false,
    deleting: false,
    permissions: 0,
    selected: null,
    snackbar: "",
  });
  const { open, onCancel, domain, folderID } = props;
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

  const handlePermissions = (e: ChangeEvent) => {
    const value = parseInt(e.target.value); // Input value (1 bit is 1, rest 0)
    const mask = state.permissions ^ (value || 1); // Toggle nth bit or at least the 0th
    setState({
      ...state,
      permissions: mask,
    });
  }

  const handleRadioPermissions = (e: ChangeEvent) => {
    const { value } = e.target;
    let mask = state.permissions;
    const intValue = parseInt(value);
    switch (intValue) {
    case 0x10: {
      mask = mask & ~(0x50) ^ intValue; // Set delete own right bit
      break;
    }
    case 0x50: {
      mask = (mask | 0x50); // Set own and any delete right bits
      break;
    }
    default:
      mask &= ~(0x50); // Remove own and any delete right bits
      break;
    }
    setState({ ...state, permissions: mask });
  }

  const handleUserSelect = (user: Owner) => () => {
    setState({ ...state, selected: user, permissions: user.permissions });
  }

  const handleSave = () => {
    const { domain, folderID, onSuccess, onError } = props;
    const { selected, permissions } = state;
    dispatch(setFolderPermissions(domain.ID, folderID, selected.memberID, { permissions }))
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
      TransitionProps={{
        onEnter: handleEnter,
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
        <FormControl fullWidth style={{ marginBottom: 4 }}>
          <InputLabel>{t('Profile')}</InputLabel>
          <Select
            value={permissionProfiles.findIndex(profile => profile.value === permissions) === -1 ? "" : permissions}
            label={t('Profile')}
            onChange={handleProfileSelect}
          >
            {permissionProfiles.map((profile, idx) =>
              <MenuItem key={idx} value={profile.value}>
                {t(profile.name)}
              </MenuItem>
            )}
          </Select>
        </FormControl>
        <Grid2 container>
          <Grid2 size={6}>
            <FormControl className={classes.form}>
              <FormLabel>{t("Read")}</FormLabel>
              <RadioGroup defaultValue={0} value={permissions & 1} onChange={handlePermissions}>
                <FormControlLabel
                  value={0x0}
                  control={<Radio size="small" className={classes.radio}/>}
                  label={t("None")}
                />
                <FormControlLabel
                  value={0x1}
                  control={<Radio size="small" className={classes.radio}/>}
                  label={t("Full details")}
                />
              </RadioGroup>
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl className={classes.form}>
              <FormLabel>{t("Write")}</FormLabel>
              <FormControlLabel
                control={
                  <Checkbox
                    value={0x2}
                    checked={Boolean(permissions & 0x2)}
                    onChange={handlePermissions}
                    className={classes.radio}
                    color="primary"
                  />
                }
                label={t('Create items')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    value={0x80}
                    checked={Boolean(permissions & 0x80)}
                    className={classes.radio}
                    onChange={handlePermissions}
                    color="primary"
                  />
                }
                label={t('Create subfolders')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(permissions & 0x8)}
                    value={0x8}
                    className={classes.radio}
                    onChange={handlePermissions}
                    color="primary"
                  />
                }
                label={t('Edit own')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.radio}
                    checked={Boolean(permissions & 0x20)}
                    value={0x20}
                    onChange={handlePermissions}
                    color="primary"
                  />
                }
                label={t('Edit all')}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <Grid2 container style={{ marginTop: 16 }}>
          <Grid2 size={6}>
            <FormControl className={classes.form}>
              <FormLabel>{t("Delete items")}</FormLabel>
              <RadioGroup
                value={(permissions & 0x50) || true /* This is a bit janky */}
                defaultValue={true}
                onChange={handleRadioPermissions}
              >
                <FormControlLabel
                  value={(permissions & 0x50) === 0} // Has explicit handling
                  control={<Radio size="small" className={classes.radio}/>}
                  label={t("None")} />
                <FormControlLabel
                  value={0x10}
                  control={<Radio size="small" className={classes.radio}/>}
                  label={t("Own")}
                />
                <FormControlLabel
                  value={0x50}
                  control={<Radio size="small" className={classes.radio}/>}
                  label={t("All")}
                />
              </RadioGroup>
            </FormControl>
          </Grid2>
          <Grid2 size={6}>
            <FormControl className={classes.form}>
              <FormLabel>{t("Other")}</FormLabel>
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.radio}
                    checked={Boolean(permissions & 0x100)}
                    value={0x100}
                    onChange={handlePermissions}
                    color="primary"
                  />
                }
                label={t('Folder owner')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.radio}
                    checked={Boolean(permissions & 0x200)}
                    onChange={handlePermissions}
                    color="primary"
                    value={0x200}
                  />
                }
                label={t('Folder contact')}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    className={classes.radio}
                    checked={Boolean(permissions & 0x400)}
                    onChange={handlePermissions}
                    color="primary"
                    value={0x400}
                  />
                }
                label={t('Folder visible')}
              />
            </FormControl>
          </Grid2>
        </Grid2>
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
