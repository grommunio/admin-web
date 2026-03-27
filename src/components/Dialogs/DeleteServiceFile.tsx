// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../store';
import { deleteDBFile } from '../../actions/dbconf';


type DeleteServiceFileProps = {
  file: string;
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  service: string;
}

const DeleteServiceFile = (props: DeleteServiceFileProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { file, onSuccess, onError, service } = props;

  const deleteItem = async (service: string, file: string) =>
    await dispatch(deleteDBFile(service, file));

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    
    setLoading(true);
    deleteItem(service, file)
      .then(msg => {
        if(onSuccess) onSuccess(msg);
        setLoading(false);
      })
      .catch(error => {
        if(onError) onError(error);
        setLoading(false);
      });
  }

  const { open, onClose } = props;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to delete {file}?</DialogTitle>
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
        >
          {loading ? <CircularProgress size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default DeleteServiceFile;
