// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { Dialog, DialogTitle, Button, DialogActions, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Service } from '@/types/dashboard';


type ConfirmRestartStopProps = {
  open: boolean;
  handleConfirm: () => void;
  onClose: () => void;
  action: string;
  service: Pick<Service, 'name'>;
};


const ConfirmRestartStop = (props: ConfirmRestartStopProps) => {
  const { t } = useTranslation();
  const { open, handleConfirm, onClose, action, service } = props;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to {action} {service?.name || 'this service'}?</DialogTitle>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          type="submit"
          autoFocus
        >
          {t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default ConfirmRestartStop;
