// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, 
  Button, DialogActions, CircularProgress,
  Theme,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { fetchAllUsers, fetchUsersData, setUserFolderPermissions } from '../../actions/users';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { Domain } from '@/types/domains';
import { useAppDispatch, useAppSelector } from '../../store';
import { USER_STATUS, UserListItem } from '../../types/users';
import { ALL_FOLDER_PERMISSIONS, MAIL_FOLDER_PERMISSIONS, CAL_FOLDER_PERMISSIONS, ALL_MAIL_FOLDER_PERMISSIONS } from '../../constants';


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  select: {
    minWidth: 60,
  },
}));


type AddUserFolderMemberProps = {
  open: boolean;
  domain: Domain;
  username: string;
  folderID: number;
  folderContainer: string;
  onError: (err: string) => void;
  onSuccess: () => void;
  onClose: () => void;
}

const AddUserFolderMember = (props: AddUserFolderMemberProps) => {
  const { open, onClose, onSuccess, onError, domain, username, folderID, folderContainer } = props;
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [ member, setMember ] = useState<UserListItem | null>(null);
  const [ permissions, setPermissions ] = useState<number[]>([]);
  const [ recursive, setRecursive ] = useState<boolean>(false);
  const [ all, setAll ] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { Users } = useAppSelector(state => state.users);
  const userEmail = username + '@' + domain.domainname;

  useEffect(() => {
    if(domain.orgID) {
      dispatch(fetchAllUsers({
        limit: 100000,
        sort: "username,asc",
        orgID: domain.orgID,
        status: USER_STATUS.NORMAL,
      }))
        .catch();
    } else {
      dispatch(fetchUsersData(domain.ID, { limit: 100000, sort: "username,asc", status: USER_STATUS.NORMAL }))
        .catch();
    }
  }, [domain]);

  const handleAdd = () => {
    dispatch(setUserFolderPermissions(userEmail, folderID, {
      username: member?.username || "",
      permissions: all ? [folderContainer === "IPF.Appointment" ? ALL_FOLDER_PERMISSIONS : ALL_MAIL_FOLDER_PERMISSIONS] : permissions,
      recursive: recursive,
    }))
      .then(() => {
        setMember(null);
        setRecursive(false);
        setPermissions([]);
        setLoading(false);
        onSuccess();
      })
      .catch((snackbar) => {
        setLoading(false);
        onError(snackbar);
      });
  }

  const handleAutocomplete = (_: unknown, newVal: UserListItem) => {
    setMember(newVal);
  }

  const handleMultiselectChange = (event: SelectChangeEvent<number[]>)=> {
    const { value } = event.target;
    setPermissions(value as number[]);
  };

  const handleRecursive = () => setRecursive(!recursive);

  const handleAll = () => setAll(!all);

  const fullUserOptions = useMemo(() => ([
    {ID: -1, domainID: -1, username: "default"},
    {ID: -2, domainID: -1, username: "anonymous"},
    ...Users
  ]), [Users]);

  const permissionOptions = folderContainer === "IPF.Appointment" ? CAL_FOLDER_PERMISSIONS : MAIL_FOLDER_PERMISSIONS;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {t('addHeadline', { item: 'Member' })}
        <div style={{ marginTop: -2 }}>
          <Typography variant='caption'>{t("Select existing member to grant additional permissions")}</Typography>
        </div>
      </DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <MagnitudeAutocomplete<UserListItem>
            value={member || []}
            filterAttribute={'username'}
            onChange={handleAutocomplete}
            className={classes.input} 
            options={fullUserOptions || []}
            label={t('Owners')}
            placeholder={t("Search users")  + "..."}
            getOptionKey={(option: UserListItem) => `${option.ID}_${option.domainID}`}
          />
          <div style={{ display: "flex", alignItems: "center" }}>
            <FormControl fullWidth>
              <InputLabel>{t("Permissions")}</InputLabel>
              <Select
                multiple
                value={all ? permissionOptions.map(p => p.value) : permissions}
                onChange={handleMultiselectChange}
                label={t("Permissions")}
                disabled={all}
              >
                {permissionOptions.map(({ name, value }) => (
                  <MenuItem
                    key={value}
                    value={value}
                  >
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={all}
                  onChange={handleAll}
                  name="all"
                  color="primary"
                  sx={{ ml: 2 }}
                />
              }
              label={t("All")}
            />
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={recursive}
                onChange={handleRecursive}
                name="recursive"
                color="primary"
              />
            }
            sx={{ mt: 1 }}
            label={t("Recursive")}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={!member || loading || (!all && permissions.length === 0)}
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddUserFolderMember;
