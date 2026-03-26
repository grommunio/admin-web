// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';


type GeneralDeleteProps = {
  id: number;
  open: boolean;
  item: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  onClose: () => void;
  delete: (id: number | string) => Promise<any>;
}

const GeneralDelete = (props: GeneralDeleteProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    const { id, onSuccess, onError } = props;
    setLoading(true);
    props.delete(id)
      .then(msg => {
        if(onSuccess) onSuccess(msg);
        setLoading(false);
      })
      .catch(err => {
        if(onError) onError(err);
        setLoading(false);
      });
  }

  const { open, item, onClose } = props;
  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('deleteDialog', { item })}?</DialogTitle>
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


export default GeneralDelete;
