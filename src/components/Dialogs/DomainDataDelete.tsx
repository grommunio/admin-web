// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';


type DomainDataDeleteProps = {
  id: number;
  open: boolean;
  item: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  delete: (domainID: number, id: number) => Promise<any>;
  domainID: number;
}

const DomainDataDelete = (props: DomainDataDeleteProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    const { id, onSuccess, onError, domainID } = props;
    setLoading(true);
    props.delete(domainID, id)
      .then(msg => {
        if(onSuccess) onSuccess(msg);
        setLoading(false);
      })
      .catch(error => {
        if(onError) onError(error);
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
      <DialogTitle>Are you sure you want to delete {item}?</DialogTitle>
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


export default DomainDataDelete;
