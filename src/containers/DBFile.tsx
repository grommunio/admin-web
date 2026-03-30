// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid2,
  TextField,
  FormControl,
  Button,
  IconButton,
  Theme,
} from '@mui/material';
import { fetchServiceFile, editServiceFile } from '../actions/dbconf';
import { Add, Delete } from '@mui/icons-material';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { useNavigate } from 'react-router';
import { ChangeEvent, KeyValuePair } from '@/types/common';
import { useAppDispatch } from '../store';


const useStyles = makeStyles()((theme: Theme) => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  flexTextfield: {
    flex: 1,
    margin: theme.spacing(0, 1, 0, 1),
  },
}));

const DBFile = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    data: [],
    unsaved: false,
    deleting: false,
    loading: true,
    snackbar: "",
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const fetch = async (service: string, filename: string) =>
    await dispatch(fetchServiceFile(service, filename));
  const edit = async (service: string, filename: string, fileData: { data: Record<string, string> }) =>
    await dispatch(editServiceFile(service, filename, fileData));

  useEffect(() => {
    const inner = async () => {
      const splits = window.location.pathname.split('/');
      const file = await fetch(splits[2], splits[3])
        .catch((message: string) => setState({ ...state, snackbar: message || 'Unknown error' }));
      
      const data: KeyValuePair<string>[] = [];
      Object.entries(file?.data || {}).forEach(([key, value]: [string, string]) => data.push({ key, value }));
      setState({
        ...state, 
        loading: false,
        data,
      });
    }

    inner();
  }, []);

  const handleDataInput = (field: string, idx: number) => (e: ChangeEvent) => {
    const data = [...state.data];
    data[idx][field] = e.target.value;
    setState({ ...state, data });
  }

  const handleAddRow = () => {
    const data = [...state.data];
    data.push({ key: '', value: '' });
    setState({ ...state, data });
  }

  const handleRemoveRow = (idx: number) => () => {
    const data = [...state.data];
    data.splice(idx, 1);
    setState({ ...state, data });
  }

  const handleEdit = () => {
    const splits = window.location.pathname.split('/');
    edit(splits[2], splits[3], { data: formatData(state.data) })
      .then(resp => setState({ ...state, snackbar: 'Success! ' + (resp?.message || '')}))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const formatData = (data: KeyValuePair<string>[]) => {
    const obj: Record<string, string> = {};
    data.forEach(pair => obj[pair.key] = pair.value);
    return obj;
  }

  const { snackbar, data, loading } = state;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  return (
    <ViewWrapper
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
    >
      <Paper className={classes.paper} elevation={1}>
        <Grid2 container>
          <Typography
            color="primary"
            variant="h5"
          >
            {t('editHeadline', { item: 'File' })}
          </Typography>
        </Grid2>
        <FormControl className={classes.form}>
          {data.map((pair, idx) => <Grid2 container key={idx}>
            <TextField
              label="key"
              value={pair.key}
              onChange={handleDataInput('key', idx)}
              className={classes.flexTextfield}
              variant="standard"
            />
            <TextField
              label="value"
              value={pair.value}
              onChange={handleDataInput('value', idx)}
              className={classes.flexTextfield}
              variant="standard"
            />
            {writable && <IconButton onClick={handleRemoveRow(idx)} size="large">
              <Delete color="error"/>
            </IconButton>}
          </Grid2>
          )}
          {writable && <Grid2 container justifyContent="center">
            <IconButton onClick={handleAddRow} size="large">
              <Add color="primary"/>
            </IconButton>
          </Grid2>}
        </FormControl>
        <Button
          color="secondary"
          onClick={() => navigate(-1)}
          style={{ marginRight: 8 }}
        >
          {t('Back')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEdit}
          disabled={!writable}
        >
          {t('Save')}
        </Button>
      </Paper>
    </ViewWrapper>
  );
}


export default DBFile;
