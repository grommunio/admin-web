// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2023 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { Warning } from '@mui/icons-material';

const styles = {
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
};

class PasswordSafetyDialog extends PureComponent {

  state = {
    password: '',
    status: 16,
  }

  handleCancel = () => {
    this.setState({ password: '' });
    this.props.onClose();
  }

  handleConfirm = () => {
    this.props.onConfirm(this.state);
    this.setState({ password: '', status: 16 });
  }

  handleInput = field => e => this.setState({ [field]: e.target.value });

  handleRadio = field => e => this.setState({ [field]: parseInt(e.target.value) });

  render() {
    const { classes, t, deviceID, open } = this.props;
    const { status, password } = this.state;

    return (
      <Dialog
        open={open}
        onClose={this.handleCancel}
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
            onChange={this.handleInput("password")}
            fullWidth
            type="password"
            autoComplete="new-password"
          />
          <RadioGroup
            className={classes.radios}
            onChange={this.handleRadio("status")}
            value={status}
          >
            <FormControlLabel value={16} control={<Radio />} label={t("Wipe only data related to this account")} />
            <FormControlLabel value={2} control={<Radio />} label={t("Wipe all data")} />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.handleCancel}>
            {t('Cancel')}
          </Button>
          <Button
            color="error"
            onClick={this.handleConfirm}
            disabled={!password}
            variant="contained" 
          >
            {t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

PasswordSafetyDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  deviceID: PropTypes.string,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(PasswordSafetyDialog));
