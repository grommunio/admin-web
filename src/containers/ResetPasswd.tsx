// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  TextField,
  FormControl,
  Button,
  Theme,
} from '@mui/material';
import { resetPw } from '../api';
import TableViewContainer from '../components/TableViewContainer';
import { fetchUsersList } from '../actions/users';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';
import { useAppDispatch } from '../store';
import { ChangeEvent } from '@/types/common';
import { User } from '@/types/users';


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

interface ResetPasswdState {
  selectedUser: User | null;
  newPw: string;
  reType: string;
  snackbar: string;
}

const ResetPasswd = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [state, setState] = useState<ResetPasswdState>({
    selectedUser: null,
    newPw: '',
    reType: '',
    snackbar: '',
  });
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState([]);

  const handleInput = (field: keyof typeof state) => (event: ChangeEvent) => {
    setState({
      ...state,
      [field]: event.target.value,
    });
  }

  useEffect(() => {
    const inner = async () => {
      const data = await dispatch(fetchUsersList()).catch(snackbar => setState({ ...state, snackbar }));

      if(data) setUsers(data.data);
    }
    inner();
  }, []);

  const handleSave = () => {
    if(!state.selectedUser) return;
    resetPw(state.selectedUser.username, state.newPw)
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(msg => setState({ ...state, snackbar: msg.message || 'Unknown error' }));
  }

  const handleAutocomplete = (_: unknown, newVal: User) => {
    setState({
      ...state,
      selectedUser: newVal,
    });
  }

  const { selectedUser, newPw, reType, snackbar } = state;

  return (
    <TableViewContainer
      headline={t("Reset passwd")}
      subtitle={t('Reset password of user')}
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
    >
      <Paper className={classes.paper} elevation={1}>
        <MagnitudeAutocomplete<User>
          value={selectedUser}
          filterAttribute={'username'}
          onChange={handleAutocomplete}
          options={users || []}
          label={t('Users')}
          placeholder={t("Search users") +  "..."}
          isOptionEqualToValue={(option, value) => option.ID === value.ID}
        />
        <FormControl className={classes.form}>
          <TextField 
            label={t("New password")} 
            fullWidth 
            value={newPw || ''}
            onChange={handleInput('newPw')}
          />
        </FormControl>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Repeat new password")} 
            fullWidth 
            value={reType || ''}
            onChange={handleInput('reType')}
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!newPw || !selectedUser || !reType || newPw !== reType}
        >
          {t('Save')}
        </Button>
      </Paper>
    </TableViewContainer>
  );
}


export default ResetPasswd;
