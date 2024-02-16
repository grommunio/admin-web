// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
  DialogTitle,
  DialogContent, Dialog, DialogActions,
} from '@mui/material';
import { PureComponent } from 'react';
import { changeUserPassword } from '../../api';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  content: {
    padding: theme.spacing(1, 4, 1, 4),
  },
  input: {
    margin: theme.spacing(1, 0, 1, 0),
  },
});

class ChangeUserPassword extends PureComponent {

  state = {
    newPw: '',
    checkPw: '',
  }

  handlePasswordChange = async () => {
    const { domain, onClose, onSuccess, onError, user } = this.props;
    const { newPw } = this.state;
    await changeUserPassword(domain.ID, user.ID, newPw)
      .then(() => {
        onSuccess();
        this.setState({ newPw: '', checkPw: '' });
      })
      .catch(onError);
    onClose();
  }


  render() {
    const { classes, t, changingPw, onClose } = this.props;
    const { newPw, checkPw } = this.state;
    return (
      <Dialog open={changingPw} onClose={onClose}>
        <DialogTitle>{t('Change password')}</DialogTitle>
        <DialogContent className={classes.content}>
          <TextField
            className={classes.input}
            label={t("New password")} 
            fullWidth
            type="password"
            value={newPw}
            onChange={({ target }) => this.setState({ newPw: target.value })}
            autoFocus
            onKeyPress={this.handleKeyPress}
          />
          <TextField
            className={classes.input}
            label={t("Repeat new password")} 
            fullWidth
            type="password"
            value={checkPw}
            onChange={({ target }) => this.setState({ checkPw: target.value })}
            onKeyPress={this.handleKeyPress}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            onClick={onClose}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handlePasswordChange}
            disabled={checkPw !== newPw}
          >
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ChangeUserPassword.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  changingPw: PropTypes.bool.isRequired,
  domain: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withTranslation()(
  withStyles(styles)(ChangeUserPassword));