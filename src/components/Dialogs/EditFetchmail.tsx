// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  FormControlLabel, Checkbox, Grid2, MenuItem,
  Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FetchmailConfig } from '@/types/users';
import { ChangeEvent } from '@/types/common';


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
}));


type EditFetchmailProps = {
  open: boolean;
  onClose: () => void;
  username: string;
  entry: FetchmailConfig;
  edit: (config: FetchmailConfig) => void;
}

const protocols = ["POP3", "IMAP", "POP2", "ETRN", "AUTO"];
const authTypes = ["password", "kerberos_v5", "kerberos", "kerberos_v4", "gssapi",
  "cram-md5", "otp", "ntlm", "msn", "ssh", "any"];

const EditFetchmail = (props: EditFetchmailProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [fetchmail, setFetchmail] = useState<FetchmailConfig>({
    ID: -1,
    active: true,
    srcServer: '',
    srcUser: '',
    srcPassword: '',
    srcAuth: 'password',
    srcFolder: '',
    fetchall: true,
    keep: false,
    protocol: 'POP3',
    useSSL: true,
    sslCertCheck: false,
    sslCertPath: '',
    sslFingerprint: '',
    extraOptions: '',
  });
  const { open, edit, onClose, username } = props;

  const handleEnter = () => {
    const { entry } = props;
    setFetchmail({ ...entry });
  }

  const handleInput = (field: keyof FetchmailConfig) => (event: ChangeEvent) => {
    setFetchmail({
      ...fetchmail,
      [field]: event.target.value,
    });
  }

  const handleCheckbox = (field: keyof FetchmailConfig) => (event: ChangeEvent) => {
    setFetchmail({
      ...fetchmail,
      [field]: event.target.checked,
    });
  }

  const handleAdd = () => {
    const { sslCertPath, sslFingerprint, extraOptions } = fetchmail;
    edit({
      ...fetchmail,
      sslCertPath: sslCertPath || null,
      sslFingerprint: sslFingerprint || null,
      extraOptions: extraOptions || null,
    });
  }

  const { active, srcServer, srcUser, srcPassword, srcFolder, srcAuth, fetchall, keep, protocol,
    useSSL, sslCertCheck, sslCertPath, sslFingerprint, extraOptions } = fetchmail;
  const disabled = [srcServer, srcUser, srcPassword, protocol].includes('');

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
      TransitionProps={{
        onEnter: handleEnter,
      }}>
      <DialogTitle>{t('editEntry', { username: username })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input}
            label={t("Source server") + " (host[:port])"} 
            fullWidth 
            value={srcServer || ''}
            onChange={handleInput('srcServer')}
            required
            autoFocus
          />
          <TextField 
            className={classes.input} 
            label={t("Source user")} 
            fullWidth 
            value={srcUser || ''}
            onChange={handleInput('srcUser')}
            required
          />
          <form autoComplete="off" noValidate>
            <TextField
              className={classes.input} 
              label={t("Source password")} 
              fullWidth 
              value={srcPassword || ''}
              onChange={handleInput('srcPassword')}
              type="password"
              required
              id="new-password"
              name='new-password'
              autoComplete="new-password"
            />
          </form>
          <TextField 
            className={classes.input} 
            label={t("Source folder")} 
            fullWidth 
            value={srcFolder || ''}
            onChange={handleInput('srcFolder')}
          />
          <TextField 
            className={classes.input} 
            label={t("Source auth")} 
            fullWidth 
            value={srcAuth || ''}
            onChange={handleInput('srcAuth')}
            select
          >
            {authTypes.map(t =>
              <MenuItem key={t} value={t}>{t}</MenuItem>  
            )}
          </TextField>
          <TextField 
            className={classes.input} 
            label={t("Protocol")} 
            fullWidth 
            value={protocol || ''}
            onChange={handleInput('protocol')}
            select
            required
          >
            {protocols.map(p =>
              <MenuItem key={p} value={p}>{p}</MenuItem>  
            )}
          </TextField>
          <TextField 
            className={classes.input} 
            label={t("SSL certificate path")} 
            fullWidth 
            value={sslCertPath || ''}
            onChange={handleInput('sslCertPath')}
            disabled={!useSSL}
          />
          <TextField 
            className={classes.input} 
            label={t("SSL fingerprint")} 
            fullWidth 
            value={sslFingerprint || ''}
            onChange={handleInput('sslFingerprint')}
            disabled={!useSSL}
          />
          <TextField 
            className={classes.input} 
            label={t("Extra options")} 
            fullWidth 
            value={extraOptions || ''}
            onChange={handleInput('extraOptions')}
          />
          <Grid2 container>
            <FormControlLabel
              control={
                <Checkbox
                  checked={active}
                  onChange={handleCheckbox('active')}
                  color="primary"
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={useSSL}
                  onChange={handleCheckbox('useSSL')}
                  color="primary"
                />
              }
              label="Use SSL"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={fetchall}
                  onChange={handleCheckbox('fetchall')}
                  color="primary"
                />
              }
              label="Fetch all"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={keep}
                  onChange={handleCheckbox('keep')}
                  color="primary"
                />
              }
              label="Keep"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sslCertCheck}
                  onChange={handleCheckbox('sslCertCheck')}
                  color="primary"
                  disabled={!useSSL}
                />
              }
              label="SSL certificate check"
            />
          </Grid2>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={disabled}
        >
          {t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default EditFetchmail;
