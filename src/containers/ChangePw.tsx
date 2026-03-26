// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  TextField,
  FormControl,
  Button,
  Theme,
} from '@mui/material';
import { changePw } from '../api';
import TableViewContainer from '../components/TableViewContainer';
import { ChangeEvent } from '@/types/common';


const useStyles = makeStyles()((theme: Theme) => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  input: {
    marginBottom: theme.spacing(2),
  },
}));

const ChangePw = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [state, setState] = useState({
    oldPw: '',
    newPw: '',
    reType: '',
    snackbar: '',
  });

  const handleInput = (field: keyof typeof state) => (event: ChangeEvent) => {
    setState({
      ...state,
      [field]: event.target.value,
    });
  }

  const handleSave = () => changePw(state.oldPw, state.newPw)
    .then(() => setState({ ...state, snackbar: 'Success!' }))
    .catch(msg => setState({ ...state, snackbar: msg.message || 'Unknown error' }));

  const { oldPw, newPw, reType, snackbar } = state;

  return (
    <TableViewContainer
      headline={t("Change password")}
      subtitle={t('changePw_sub')}
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
    >
      <Paper className={classes.paper} elevation={1}>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Old password")} 
            fullWidth 
            value={oldPw || ''}
            onChange={handleInput('oldPw')}
            type="password"
            autoFocus
            autoCapitalize=""
          />
        </FormControl>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("New password")} 
            fullWidth 
            value={newPw || ''}
            onChange={handleInput('newPw')}
            type="password"
          />
        </FormControl>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Repeat new password")} 
            fullWidth 
            value={reType || ''}
            onChange={handleInput('reType')}
            type="password"
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!newPw || !oldPw || !reType || newPw !== reType}
        >
          {t('Save')}
        </Button>
      </Paper>
    </TableViewContainer>
  );
}


export default ChangePw;
