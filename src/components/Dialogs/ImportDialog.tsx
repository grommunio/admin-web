// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { Dialog, DialogTitle, Button, DialogActions, CircularProgress, DialogContent, Checkbox, FormControlLabel, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { importLdapData } from '../../actions/ldap';
import { LdapUser } from '@/types/users';
import { ChangeEvent } from '@/types/common';
import { useAppDispatch } from '../../store';


type ImportDialogProps = {
  open: boolean;
  user: LdapUser;
  domainID: number;
  onSuccess: () => void;
  onClose: () => void;
  onError: (msg: string) => void;
}

const ImportDialog = (props: ImportDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    loading: false,
    force: false,
  });

  const handleChange = (event: ChangeEvent) => {
    setState({ ...state, force: event.target.checked });
  };

  const handleImport = () => {
    const { onSuccess, onError, user, domainID } = props;
    const { force } = state;
    setState({ ...state, loading: true });
    dispatch(importLdapData({ ID: user.ID, force, domain: domainID }))
      .then(() => {
        if(onSuccess) onSuccess();
        setState({ ...state, loading: false });
      })
      .catch(err => {
        if(onError) onError(err);
        setState({ ...state, loading: false });
      });
  }

  const { open, user, onClose } = props;
  const { loading, force } = state;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Are you sure you want to import {user.name}?</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Checkbox
              checked={force}
              onChange={handleChange}
              color="primary"
            />
          }
          label="force"
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
          onClick={handleImport}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress size={24}/> : t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default ImportDialog;
