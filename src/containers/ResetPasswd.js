// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Paper,
  TextField,
  FormControl,
  Button,
} from '@mui/material';
import { resetPw } from '../api';
import TableViewContainer from '../components/TableViewContainer';
import { useDispatch } from 'react-redux';
import { fetchUsersList } from '../actions/users';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';

const styles = theme => ({
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
});

const ResetPasswd = props => {
  const [state, setState] = useState({
    selectedUser: '',
    newPw: '',
    reType: '',
    snackbar: '',
  });
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);

  const handleInput = field => event => {
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

  const handleSave = () => resetPw(state.selectedUser.username, state.newPw)
    .then(() => setState({ ...state, snackbar: 'Success!' }))
    .catch(msg => setState({ ...state, snackbar: msg.message || 'Unknown error' }));

  const handleAutocomplete = (e, newVal) => {
    setState({
      ...state,
      selectedUser: newVal,
    });
  }

  const { classes, t } = props;
  const { selectedUser, newPw, reType, snackbar } = state;

  return (
    <TableViewContainer
      headline={t("Reset passwd")}
      subtitle={t('Reset password of user')}
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
    >
      <Paper className={classes.paper} elevation={1}>
        <MagnitudeAutocomplete
          value={selectedUser || []}
          filterAttribute={'username'}
          onChange={handleAutocomplete}
          options={users || []}
          label={t('Users')}
          placeholder={t("Search users") +  "..."}
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

ResetPasswd.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(ResetPasswd));
