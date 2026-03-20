// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import {
  TextField,
  Button,
  DialogTitle,
  DialogContent, Dialog, DialogActions,
  Theme,
} from '@mui/material';
import { changeUserPassword } from '../../api';
import { useTranslation } from 'react-i18next';
import { BaseDomain } from '@/types/domains';
import { BaseUser } from '@/types/users';


const useStyles = makeStyles()((theme: Theme) => ({
  content: {
    padding: theme.spacing(1, 4, 1, 4),
  },
  input: {
    margin: theme.spacing(1, 0, 1, 0),
  },
}));

type ChangeUserPasswordProps = {
  domain: BaseDomain;
  onClose: () => void;
  onSuccess: () => void;
  onError: () => void;
  user: BaseUser;
  changingPw: boolean;
}

const ChangeUserPassword = (props: ChangeUserPasswordProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [state, setState] = useState({
    newPw: '',
    checkPw: '',
  });

  const handlePasswordChange = async (e: React.MouseEvent) => {
    e.preventDefault();
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

  const handleInput = (field: keyof typeof state) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [field]: e.target.value });
  }

  const { changingPw, onClose } = props;
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
          disabled={checkPw !== newPw || newPw.length < 6}
          type="submit"
        >
          {t('Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default ChangeUserPassword;
