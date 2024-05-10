// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  Grid,
  Typography,
  IconButton, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { uploadServiceFile } from '../../actions/dbconf';
import { Add, Delete } from '@mui/icons-material';

const styles = theme => ({
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
});

const UploadServiceFile = props => {
  const [state, setState] = useState({
    data: [
      { key: '', value: '' },
    ],
    filename: '',
    service: '',
    loading: false,
  });

  const handleInput = field => event => {
    setState({
      ...state,
      [field]: event.target.value,
    });
  }

  const handleDataInput = (field, idx) => e => {
    const data = [...state.data];
    data[idx][field] = e.target.value;
    setState({ ...state, data });
  }

  const handleAddRow = () => {
    const data = [...state.data];
    data.push({ key: '', value: '' });
    setState({ ...state, data });
  }

  const handleRemoveRow = idx => () => {
    const data = [...state.data];
    data.splice(idx, 1);
    setState({ ...state, data });
  }

  const handleUpload = () => {
    const { upload } = props;
    const { service, filename, data } = state;
    setState({ ...state, loading: true });
    upload(service, filename, formatData(data))
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

  const formatData = (data) => {
    const obj = {};
    data.forEach(pair => obj[pair.key] = pair.value);
    return obj;
  }

  const { classes, t, open, onClose } = props;
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
          {data.map((pair, idx) => <Grid container key={idx}>
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
          </Grid>
          )}
          <Grid container justifyContent="center">
            <IconButton onClick={handleAddRow} size="large">
              <Add color="primary"/>
            </IconButton>
          </Grid>
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
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

UploadServiceFile.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  upload: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    upload: async (service, filename, file) => {
      await dispatch(uploadServiceFile(service, filename, file))
        .catch(message => Promise.reject(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(UploadServiceFile, styles)));
