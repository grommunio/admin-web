// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';


type DetachDialogProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onDetach: () => void;
}


const DetachDialog = (props: DetachDialogProps) => {
  const { t } = useTranslation();
  const { open, loading, onClose, onDetach } = props;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t("Are you sure you want to detach this user?")}</DialogTitle>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={onDetach}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress color="secondary" size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DetachDialog;
