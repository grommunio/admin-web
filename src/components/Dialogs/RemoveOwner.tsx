// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { deleteOwnerData } from '../../actions/folders';
import { useAppDispatch } from '../../store';


type RemoveOwnerProps = {
  open: boolean;
  ownerName: string;
  folderID: string;
  domainID: number;
  memberID: number;
  onSuccess: () => void;
  onClose: () => void;
  onError: (error: string) => void;
}

const RemoveOwner = (props: RemoveOwnerProps) => {
  const { open, ownerName, onClose, folderID, memberID, onSuccess, onError, domainID } = props;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    dispatch(deleteOwnerData(domainID, folderID, memberID))
      .then(() => {
        if(onSuccess) onSuccess();
        setLoading(false);
      })
      .catch(error => {
        if(onError) onError(error);
        setLoading(false);
      });
  }

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to remove {ownerName} from this folder?</DialogTitle>
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


export default RemoveOwner;
