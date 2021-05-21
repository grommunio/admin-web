// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  FormControlLabel, Checkbox, Grid, MenuItem,
} from '@material-ui/core';
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

class AddFetchmail extends PureComponent {

  state = {
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
  }

  protocols = ["POP3", "IMAP", "POP2", "ETRN", "AUTO"]

  authTypes = ["password", "kerberos_v5", "kerberos", "kerberos_v4", "gssapi",
    "cram-md5", "otp", "ntlm", "msn", "ssh", "any"]

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleCheckbox = field => event => {
    this.setState({
      [field]: event.target.checked,
    });
  }

  handleAdd = () => {
    const { add } = this.props;
    const { active, srcServer, srcUser, srcPassword, srcAuth, srcFolder, fetchall, keep, protocol,
      useSSL, sslCertCheck, sslCertPath, sslFingerprint, extraOptions } = this.state;
    add({
      active: active,
      srcServer: srcServer,
      srcUser: srcUser,
      srcPassword: srcPassword,
      srcAuth: srcAuth,
      srcFolder: srcFolder,
      fetchall: fetchall,
      keep: keep,
      protocol: protocol,
      useSSL: useSSL,
      sslCertCheck: sslCertCheck,
      sslCertPath: sslCertPath || null,
      sslFingerprint: sslFingerprint || null,
      extraOptions: extraOptions || null,
    });
    this.setState({
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

  render() {
    const { classes, t, open, onClose } = this.props;
    const { active, srcServer, srcUser, srcPassword, srcFolder, srcAuth, fetchall, keep, protocol,
      useSSL, sslCertCheck, sslCertPath, sslFingerprint, extraOptions } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'Entry' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form} component="form" autoComplete="off" noValidate>
            <TextField 
              className={classes.input} 
              label={t("Source server")} 
              fullWidth 
              value={srcServer || ''}
              onChange={this.handleInput('srcServer')}
              autoFocus
              required
            />
            <TextField 
              className={classes.input} 
              label={t("Source user")} 
              fullWidth 
              value={srcUser || ''}
              onChange={this.handleInput('srcUser')}
              required
            />
            <form autoComplete="off" noValidate>
              <TextField 
                className={classes.input} 
                label={t("Source password")} 
                fullWidth 
                value={srcPassword || ''}
                onChange={this.handleInput('srcPassword')}
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
              onChange={this.handleInput('srcFolder')}
              required
            />
            <TextField 
              className={classes.input} 
              label={t("Source auth")} 
              fullWidth 
              value={srcAuth || ''}
              onChange={this.handleInput('srcAuth')}
              select
            >
              {this.authTypes.map(t =>
                <MenuItem key={t} value={t}>{t}</MenuItem>  
              )}
            </TextField>
            <TextField 
              className={classes.input} 
              label={t("Protocol")} 
              fullWidth 
              value={protocol || ''}
              onChange={this.handleInput('protocol')}
              select
              required
            >
              {this.protocols.map(p =>
                <MenuItem key={p} value={p}>{p}</MenuItem>  
              )}
            </TextField>
            <TextField 
              className={classes.input} 
              label={t("SSL certificate path")} 
              fullWidth 
              value={sslCertPath || ''}
              onChange={this.handleInput('sslCertPath')}
              disabled={!useSSL}
            />
            <TextField 
              className={classes.input} 
              label={t("SSL fingerprint")} 
              fullWidth 
              value={sslFingerprint || ''}
              onChange={this.handleInput('sslFingerprint')}
              disabled={!useSSL}
              error={!sslFingerprint.match(/^([0-9A-F]{2}(:[0-9A-F]{2})*)?$/)}
            />
            <TextField 
              className={classes.input} 
              label={t("Extra options")} 
              fullWidth 
              value={extraOptions || ''}
              onChange={this.handleInput('extraOptions')}
            />
            <Grid container>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={active}
                    onChange={this.handleCheckbox('active')}
                    color="primary"
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useSSL}
                    onChange={this.handleCheckbox('useSSL')}
                    color="primary"
                  />
                }
                label="Use SSL"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fetchall}
                    onChange={this.handleCheckbox('fetchall')}
                    color="primary"
                  />
                }
                label="Fetch all"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={keep}
                    onChange={this.handleCheckbox('keep')}
                    color="primary"
                  />
                }
                label="Keep"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sslCertCheck}
                    onChange={this.handleCheckbox('sslCertCheck')}
                    color="primary"
                    disabled={!useSSL}
                  />
                }
                label="SSL certificate check"
              />
            </Grid>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            variant="contained"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
          >
            {t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddFetchmail.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(AddFetchmail));