// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, 
  Button, DialogActions, CircularProgress,
  Theme,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { fetchAllUsers, fetchUsersData, setUserFolderPermissions } from '../../actions/users';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { Domain } from '@/types/domains';
import { useAppDispatch, useAppSelector } from '../../store';
import { USER_STATUS, UserListItem } from '../../types/users';
import PermissionsGrid from '../PermissionsGrid';


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
  const [ permissions, setPermissions ] = useState<number>(0);
  const [ recursive, setRecursive ] = useState<boolean>(false);
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
      permissions,
      recursive,
    }))
      .then(() => {
        setMember(null);
        setRecursive(false);
        setPermissions(0);
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

  const handleRecursive = () => setRecursive(!recursive);

  const fullUserOptions = useMemo(() => ([
    {ID: -1, domainID: -1, username: "default"},
    {ID: -2, domainID: -1, username: "anonymous"},
    ...Users
  ]), [Users]);

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
          <PermissionsGrid
            permissions={permissions}
            setPermissions={setPermissions}
            isCalendarFolder={folderContainer === "IPF.Appointment"}
          />
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
          disabled={!member || loading}
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddUserFolderMember;
