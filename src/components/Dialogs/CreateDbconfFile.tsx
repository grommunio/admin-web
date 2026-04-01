// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  Grid2,
  Typography,
  MenuItem,
  Theme, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { uploadServiceFile } from '../../actions/dbconf';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store';
import { ChangeEvent, KeyValuePair } from '@/types/common';


const useStyles = makeStyles()((theme: Theme) => ({
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
  flexTextfield: {
    flex: 1,
    margin: theme.spacing(1, 1, 0, 1),
  },
  gridTypo: {
    minWidth: 120,
    marginBottom: 2,
  },
}));


type CreateDbconfFileProps = {
  open: boolean;
  onClose: () => void;
  onError: (err: string) => void;
}

const CreateDbconfFile = (props: CreateDbconfFileProps) => {
  const [state, setState] = useState({
    data: [
      { key: 'commit_key', value: '' },
      { key: 'commit_file', value: '' },
      { key: 'commit_service', value: '' },
    ],
    service: '',
    loading: false,
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { classes } = useStyles();
  const { commands } = useAppSelector(state => state.dbconf);

  const commandKeys = ['key', 'file', 'service'] as (keyof typeof commands)[];

  const handleInput = (field: keyof typeof state) => (event: ChangeEvent) => {
    setState({
      ...state,
      [field]: event.target.value,
    });
  }

  const handleDataInput = (idx: number) => (e: ChangeEvent) => {
    const data = [...state.data];
    data[idx].value = e.target.value;
    setState({ ...state, data });
  }

  const handleUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    const { onError } = props;
    const { service, data } = state;
    setState({ ...state, loading: true });
    // Create service
    dispatch(uploadServiceFile('grommunio-dbconf', service, formatData(data)))
      .then(() => {
        // Create service file
        navigate('/dbconf/grommunio-dbconf/' + service);
      })
      .catch(error => {
        onError(error);
        setState({ ...state, loading: false });
      });
  }

  const formatData = (data: KeyValuePair<string>[]): Record<string, string | undefined> => {
    const obj: Record<string, string | undefined> = {};
    data.forEach((pair: KeyValuePair<string>) => obj[pair.key] = pair.value || undefined);
    return obj;
  }

  const handleTemplate = (e: ChangeEvent) => {
    const { value } = e.target;
    if (value === "postfix") {
      setState({
        ...state,
        service: 'postfix',
        data: [
          { key: 'commit_key', value: '#POSTCONF' },
          { key: 'commit_file', value: '#POSTCONF' },
          { key: 'commit_service', value: '#RELOAD' },
        ]
      });
    }
  }

  const { open, onClose } = props;
  const { service, data, loading } = state;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Configure grommunio-dbconf</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Template")} 
            fullWidth
            onChange={handleTemplate}
            select
          >
            <MenuItem value={""}></MenuItem>
            <MenuItem value="postfix">postfix</MenuItem>
          </TextField>
          <TextField 
            className={classes.input} 
            label={t("Service name")} 
            fullWidth 
            value={service || ''}
            onChange={handleInput('service')}
            autoFocus
            required
          />
          <Typography variant="h6">Data</Typography>
          {data.map((pair: KeyValuePair<string>, idx: number) => <Grid2 key={idx} container alignItems="center">
            <Typography className={classes.gridTypo}>
              {pair.key}
            </Typography>
            <TextField
              label={t("Value")}
              value={pair.value}
              onChange={handleDataInput(idx)}
              className={classes.flexTextfield}
              select
            >
              <MenuItem value={""}></MenuItem>
              {commands[commandKeys[idx]].map((command, idx) =>
                <MenuItem key={idx} value={command}>
                  {command}
                </MenuItem>
              )}
            </TextField>
          </Grid2>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          color="primary"
          disabled={loading || !service}
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default CreateDbconfFile;
