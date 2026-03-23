// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { Dialog, DialogTitle, DialogContent,Button,
  DialogActions,
} from '@mui/material';
import { useTranslation } from 'react-i18next';


type DumpDialogProps = {
  open: boolean;
  dump: string;
  onClose: () => void;
}

const DumpDialog = (props: DumpDialogProps) => {
  const { t } = useTranslation();
  const { open, dump, onClose } = props;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>{t('Raw LDAP data')}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <pre>{dump}</pre>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default DumpDialog;
