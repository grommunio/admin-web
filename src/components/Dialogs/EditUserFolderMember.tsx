// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
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
import { updateUserFolderPermissions } from '../../actions/users';
import { Domain } from '@/types/domains';
import { useAppDispatch } from '../../store';
import { ALL_FOLDER_PERMISSIONS, MAIL_FOLDER_PERMISSIONS, CAL_FOLDER_PERMISSIONS, ALL_MAIL_FOLDER_PERMISSIONS } from '../../constants';
import { UserFolderPermission } from '@/types/users';


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
  permittedUser: UserFolderPermission | null;
  onError: (err: string) => void;
  onSuccess: () => void;
  onClose: () => void;
}


function getInitialSelection(rights: number, isCalFolder: boolean) {
  return (isCalFolder ? CAL_FOLDER_PERMISSIONS : MAIL_FOLDER_PERMISSIONS)
    .filter(p => p.value & rights)
    .map(p => p.value);
}


const EditUserFolderMember = (props: AddUserFolderMemberProps) => {
  const { open, onClose, onSuccess, onError, domain, username, folderID, folderContainer, permittedUser } = props;
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [ permissions, setPermissions ] = useState<number[]>([]);
  const [ recursive, setRecursive ] = useState<boolean>(false);
  const [ all, setAll ] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const userEmail = username + '@' + domain.domainname;

  const handleEnter = () => {
    if(permittedUser) {
      setPermissions(getInitialSelection(permittedUser.rights, folderContainer === "IPF.Appointment"))
    }
  };

  const handleAdd = () => {
    if(!permittedUser) return;
    dispatch(updateUserFolderPermissions(userEmail, folderID, permittedUser.name, {
      permissions: all ? [folderContainer === "IPF.Appointment" ? ALL_FOLDER_PERMISSIONS : ALL_MAIL_FOLDER_PERMISSIONS] : permissions,
      recursive: recursive,
    }))
      .then(() => {
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

  const handleMultiselectChange = (event: SelectChangeEvent<number[]>)=> {
    const { value } = event.target;
    setPermissions(value as number[]);
  };

  const handleRecursive = () => setRecursive(!recursive);

  const handleAll = () => setAll(!all);

  const permissionOptions = folderContainer === "IPF.Appointment" ? CAL_FOLDER_PERMISSIONS : MAIL_FOLDER_PERMISSIONS;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{
        transition: {
          onEnter: handleEnter,
        }
      }}
    >
      <DialogTitle>
        {t('addHeadline', { item: 'Member' })}
        <div style={{ marginTop: -2 }}>
          <Typography variant='caption'>{t("Select existing member to grant additional permissions")}</Typography>
        </div>
      </DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
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
          disabled={loading || (!all && permissions.length === 0)}
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserFolderMember;
