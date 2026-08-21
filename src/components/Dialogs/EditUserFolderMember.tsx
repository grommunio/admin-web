// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, 
  Button, DialogActions, CircularProgress,
  Theme,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { updateUserFolderPermissions } from '../../actions/users';
import { Domain } from '@/types/domains';
import { useAppDispatch } from '../../store';
import { UserFolderPermission } from '@/types/users';
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
  permittedUser: UserFolderPermission | null;
  onError: (err: string) => void;
  onSuccess: () => void;
  onClose: () => void;
}


const EditUserFolderMember = (props: AddUserFolderMemberProps) => {
  const { open, onClose, onSuccess, onError, domain, username, folderID, folderContainer, permittedUser } = props;
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [ permissions, setPermissions ] = useState<number>(0);
  const [ recursive, setRecursive ] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const userEmail = username + '@' + domain.domainname;

  const handleEnter = () => {
    if(permittedUser) {
      setPermissions(permittedUser.rights)
    }
  };

  const handleAdd = () => {
    if(!permittedUser) return;
    dispatch(updateUserFolderPermissions(userEmail, folderID, permittedUser.name, {
      permissions: permissions,
      recursive: recursive,
    }))
      .then(() => {
        setLoading(false);
        onSuccess();
        onClose();
      })
      .catch((snackbar) => {
        setLoading(false);
        onError(snackbar);
      });
  }

  const handleRecursive = () => setRecursive(!recursive);

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
          disabled={loading}
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : 'Edit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditUserFolderMember;
