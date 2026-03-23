// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Warning } from '@mui/icons-material';
import { ChangeEvent } from '@/types/common';
import { RemoteWipeParams } from '@/types/sync';


const useStyles = makeStyles()(() => ({
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    overflow: 'hidden',
  },
  radios: {
    marginTop: 16,
  },
}));


type PasswordSafetyDialogProps = {
  deviceID: string;
  open: boolean;
  onConfirm: (state: RemoteWipeParams) => void;
  onClose: () => void;
}

const PasswordSafetyDialog = (props: PasswordSafetyDialogProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [state, setState] = useState<RemoteWipeParams>({
    password: '',
    status: 16,
  });

  const handleCancel = () => {
    setState({ ...state, password: '' });
    props.onClose();
  }

  const handleConfirm = e => {
    e.preventDefault();
    props.onConfirm(state);
    setState({ ...state, password: '', status: 16 });
  }

  const handleInput = (field: keyof typeof state) => (e: ChangeEvent) =>
    setState({ ...state, [field]: e.target.value });

  const handleRadio = (field: keyof typeof state) => (e: ChangeEvent) =>
    setState({ ...state, [field]: parseInt(e.target.value) });

  const { deviceID, open } = props;
  const { status, password } = state;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
    >
      <DialogTitle className={classes.iconContainer}>
        <Warning
          color="warning"
          fontSize="large"
        />
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Typography variant="h6" align="center" style={{ marginBottom: 8 }}>
            Remote wipe of device {deviceID || '<unknown>'} engaged
        </Typography>
        <Typography variant="body1">
          {t('RemoteWipeExplanation')}
        </Typography>
        <TextField
          style={{ marginTop: 16 }}
          label={t('Enter password to confirm')}
          value={password}
          onChange={handleInput("password")}
          fullWidth
          autoFocus
          type="password"
          autoComplete="new-password"
        />
        <RadioGroup
          className={classes.radios}
          onChange={handleRadio("status")}
          value={status}
        >
          <FormControlLabel value={16} control={<Radio />} label={t("Wipe only data related to this account")} />
          <FormControlLabel value={2} control={<Radio />} label={t("Wipe all data")} />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleCancel}>
          {t('Cancel')}
        </Button>
        <Button
          color="error"
          onClick={handleConfirm}
          disabled={!password}
          variant="contained"
          type="submit"
        >
          {t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default PasswordSafetyDialog;
