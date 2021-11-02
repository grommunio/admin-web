import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
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
};

class PasswordSafetyDialog extends PureComponent {

  state = {
    password: '',
  }

  handleCancel = () => {
    this.setState({ password: '' });
    this.props.onClose();
  }

  handleConfirm = password => () => {
    this.setState({ password: '' });
    this.props.onConfirm(password);
  }

  handleInput = e => this.setState({ password: e.target.value });

  render() {
    const { classes, t, deviceID, open } = this.props;
    const { password } = this.state;

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
            onChange={this.handleInput}
            fullWidth
            type="password"
            autoComplete="new-password"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={this.handleCancel}>
            {t('Cancel')}
          </Button>
          <Button
            color="error"
            onClick={this.handleConfirm(password)}
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
