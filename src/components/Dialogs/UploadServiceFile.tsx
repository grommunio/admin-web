// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  Grid2,
  Typography,
  IconButton,
  Theme, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { uploadServiceFile } from '../../actions/dbconf';
import { Add, Delete } from '@mui/icons-material';
import { useAppDispatch } from '../../store';
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
    margin: theme.spacing(0, 1, 0, 1),
  },
}));


type UploadServiceFileProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (err: string) => void;
}


const UploadServiceFile = (props: UploadServiceFileProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    data: [
      { key: '', value: '' },
    ],
    filename: '',
    service: '',
    loading: false,
  });

  const handleInput = (field: keyof typeof state) => (event: ChangeEvent) => {
    setState({
      ...state,
      [field]: event.target.value,
    });
  }

  const handleDataInput = (field: 'key' | 'value', idx: number) => (e: ChangeEvent) => {
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

  const handleUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    const { service, filename, data } = state;
    setState({ ...state, loading: true });
    dispatch(uploadServiceFile(service, filename, formatData(data)))
      .then(() => {
        setState({
          ...state, 
          data: [{ key: '', value: '' }],
          filename: '',
          service: '',
          loading: false,
        });
        props.onSuccess();
      })
      .catch(error => {
        props.onError(error);
        setState({ ...state, loading: false });
      });
  }

  const formatData = (data: KeyValuePair<string>[]) => {
    const obj: Record<string, string> = {};
    data.forEach(pair => obj[pair.key] = pair.value);
    return obj;
  }

  const { open, onClose } = props;
  const { service, filename, data, loading } = state;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{t('addHeadline', { item: 'File' })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Service name")} 
            fullWidth 
            value={service || ''}
            onChange={handleInput('service')}
            autoFocus
            required
          />
          <TextField 
            className={classes.input} 
            label={t("File name")} 
            fullWidth 
            value={filename || ''}
            onChange={handleInput('filename')}
            required
          />
          <Typography>{t("Data")}</Typography>
          {data.map((pair, idx) => <Grid2 container key={idx}>
            <TextField
              label={t("Key")}
              value={pair.key}
              onChange={handleDataInput('key', idx)}
              className={classes.flexTextfield}
            />
            <TextField
              label={t("Value")}
              value={pair.value}
              onChange={handleDataInput('value', idx)}
              className={classes.flexTextfield}
            />
            <IconButton onClick={handleRemoveRow(idx)} size="large">
              <Delete color="error"/>
            </IconButton>
          </Grid2>
          )}
          <Grid2 container justifyContent="center">
            <IconButton onClick={handleAddRow} size="large">
              <Add color="primary"/>
            </IconButton>
          </Grid2>
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
          disabled={loading || !service || !filename}
          type='submit'
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default UploadServiceFile;
