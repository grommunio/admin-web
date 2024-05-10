// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
  DialogTitle,
  DialogContent, Dialog, DialogActions,
} from '@mui/material';
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

const ChangeUserPassword = props => {
  const [state, setState] = useState({
    newPw: '',
    checkPw: '',
  });

  const handlePasswordChange = async () => {
    const { domain, onClose, onSuccess, onError, user } = props;
    const { newPw } = state;
    await changeUserPassword(domain.ID, user.ID, newPw)
      .then(() => {
        onSuccess();
        setState({ ...state, newPw: '', checkPw: '' });
      })
      .catch(onError);
    onClose();
  }

  const handleInput = field => e => {
    setState({ ...state, [field]: e.target.value });
  }

  const { classes, t, changingPw, onClose } = props;
  const { newPw, checkPw } = state;
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
          onChange={handleInput("newPw")}
          autoFocus
        />
        <TextField
          className={classes.input}
          label={t("Repeat new password")} 
          fullWidth
          type="password"
          value={checkPw}
          onChange={handleInput("checkPw")}
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
          onClick={handlePasswordChange}
          disabled={checkPw !== newPw}
        >
          {t('Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
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
  withStyles(ChangeUserPassword, styles));