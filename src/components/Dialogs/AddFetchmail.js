// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  FormControlLabel, Checkbox, Grid2, MenuItem,
} from '@mui/material';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
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
});

const AddFetchmail = props => {
  const [fetchmail, setFetchmail] = useState({
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
    sslCertPath: '', // Set to null if empty
    sslFingerprint: '',
    extraOptions: '',
  });

  const protocols = ["POP3", "IMAP", "POP2", "ETRN", "AUTO"];

  const authTypes = ["password", "kerberos_v5", "kerberos", "kerberos_v4", "gssapi",
    "cram-md5", "otp", "ntlm", "msn", "ssh", "any"]

  const handleInput = field => event => {
    setFetchmail({
      ...fetchmail,
      [field]: event.target.value,
    });
  }

  const handleCheckbox = field => event => {
    setFetchmail({
      ...fetchmail,
      [field]: event.target.checked,
    });
  }

  const handleAdd = () => {
    const { add } = props;
    const { sslCertCheck, sslCertPath, sslFingerprint, extraOptions } = fetchmail;
    add({
      ...fetchmail,
      sslCertCheck: sslCertCheck,
      sslCertPath: sslCertPath || null,
      sslFingerprint: sslFingerprint || null,
      extraOptions: extraOptions || null,
    });
    setFetchmail({
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
  }

  const { classes, t, open, onClose, username } = props;
  const { active, srcServer, srcUser, srcPassword, srcFolder, srcAuth, fetchall, keep, protocol,
    useSSL, sslCertCheck, sslCertPath, sslFingerprint, extraOptions } = fetchmail;
  const disabled = [srcServer, srcUser, srcPassword, protocol].includes('');
  
  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{t('addEntry', { username: username })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form} autoComplete="off" noValidate>
          <TextField 
            className={classes.input} 
            label={t("Source server") + " (host[:port])"} 
            fullWidth 
            value={srcServer || ''}
            onChange={handleInput('srcServer')}
            autoFocus
            required
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
              label={t("Active")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={useSSL}
                  onChange={handleCheckbox('useSSL')}
                  color="primary"
                />
              }
              label={t("Use SSL")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={fetchall}
                  onChange={handleCheckbox('fetchall')}
                  color="primary"
                />
              }
              label={t("Fetch all")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={keep}
                  onChange={handleCheckbox('keep')}
                  color="primary"
                />
              }
              label={t("Keep")}
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
              label={t("SSL certificate check")}
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
          {t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddFetchmail.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
};

export default withTranslation()(withStyles(AddFetchmail, styles));
