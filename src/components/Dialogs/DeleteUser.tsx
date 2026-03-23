// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent,Button,
  DialogActions, FormControlLabel, Checkbox, CircularProgress, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { deleteUserData } from '../../actions/users';
import { User } from '@/types/users';
import { useAppDispatch } from '../../store';


type DeleteUserProps = {
  user: User;
  open: boolean;
  domainID: number;
  onSuccess: () => void;
  onError: () => void;
  onClose: () => void;
}


const DeleteUser = (props: DeleteUserProps) => {
  const [state, setState] = useState({
    deleteFiles: false,
    deleteChatUser: false,
    loading: false,
  });
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { open, user, onClose, domainID, onSuccess, onError } = props;
  const { deleteFiles, deleteChatUser, loading } = state;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    const { deleteFiles, deleteChatUser } = state;
    setState({ ...state, loading: true });
    dispatch(deleteUserData(domainID, user.ID, { deleteFiles, deleteChatUser }))
      .then(() => {
        if(onSuccess) onSuccess();
        setState({ ...state, loading: false });
      })
      .catch(() => {
        if(onError) onError();
        setState({ ...state, loading: false });
      });
  }

  const handleCheckbox = (field: keyof typeof state) => () =>
    setState({ ...state, [field]: !state[field] });

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to delete {user.username}?</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={deleteFiles}
              onChange={handleCheckbox("deleteFiles")}
              name="deleteFiles"
              color="primary"
            />
          }
          label={t("Delete files?")}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={deleteChatUser}
              onChange={handleCheckbox("deleteChatUser")}
              name="deleteChatUser"
              color="primary"
            />
          }
          label={t("Delete grommunio-chat user")}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="secondary"
          type="submit"
          autoFocus
        >
          {loading ? <CircularProgress size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default DeleteUser;
