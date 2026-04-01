// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';


type DeleteConfigProps = {
  open: boolean;
  orgID: number;
  onSuccess: () => void;
  onError: (err: string) => void;
  onClose: () => void;
  delete: (orgID: number) => Promise<any>;
}


const DeleteConfig = (props: DeleteConfigProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    const { orgID, onSuccess, onError } = props;
    setLoading(true);
    props.delete(orgID) // Optional, will just be ignored for global config
      .then(() => {
        if(onSuccess) onSuccess();
        setLoading(false);
      })
      .catch(err => {
        if(onError) onError(err);
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
      <DialogTitle>Are you sure you want to delete the LDAP config?</DialogTitle>
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
          color="primary"
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default DeleteConfig;
