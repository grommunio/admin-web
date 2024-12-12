// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  Grid2,
  Typography,
  MenuItem, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { uploadServiceFile } from '../../actions/dbconf';
import { useNavigate } from 'react-router';

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
    margin: theme.spacing(1, 1, 0, 1),
  },
  gridTypo: {
    minWidth: 120,
    marginBottom: 2,
  },
});

const CreateDbconfFile = props => {
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

  const commandKeys = ['key', 'file', 'service'];

  const handleInput = field => event => {
    setState({
      ...state,
      [field]: event.target.value,
    });
  }

  const handleDataInput = idx => e => {
    const data = [...state.data];
    data[idx].value = e.target.value;
    setState({ ...state, data });
  }

  const handleUpload = e => {
    e.preventDefault();
    const { upload, onError } = props;
    const { service, data } = state;
    setState({ ...state, loading: true });
    // Create service
    upload('grommunio-dbconf', service, formatData(data))
      .then(() => {
        // Create service file
        navigate('/dbconf/grommunio-dbconf/' + service);
      })
      .catch(error => {
        onError(error);
        setState({ ...state, loading: false });
      });
  }

  const formatData = (data) => {
    const obj = {};
    data.forEach(pair => obj[pair.key] = pair.value || undefined);
    return obj;
  }

  const handleTemplate = e => {
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

  const { classes, t, open, onClose, commands } = props;
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
          {data.map((pair, idx) => <Grid2 key={idx} container alignItems="center">
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

CreateDbconfFile.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  upload: PropTypes.func.isRequired,
  commands: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    commands: state.dbconf.commands,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    upload: async (service, filename, file) => {
      await dispatch(uploadServiceFile(service, filename, file))
        .catch(message => Promise.reject(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(CreateDbconfFile, styles)));
