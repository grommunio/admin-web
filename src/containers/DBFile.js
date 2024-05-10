// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  IconButton,
} from '@mui/material';
import { connect } from 'react-redux';
import { fetchServiceFile, editServiceFile } from '../actions/dbconf';
import { Add, Delete } from '@mui/icons-material';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { useNavigate } from 'react-router';

const styles = theme => ({
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
});

const DBFile = props => {
  const [state, setState] = useState({
    data: [],
    unsaved: false,
    deleting: false,
    loading: true,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  useEffect(() => {
    const inner = async () => {
      const { fetch } = props;
      const splits = window.location.pathname.split('/');
      const file = await fetch(splits[2], splits[3])
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      
      const data = [];
      Object.entries(file?.data || {}).forEach(([key, value]) => data.push({ key, value }));
      setState({
        ...state, 
        loading: false,
        data,
      });
    }

    inner();
  }, []);

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

  const handleEdit = () => {
    const splits = window.location.pathname.split('/');
    props.edit(splits[2], splits[3], { data: formatData(state.data) })
      .then(resp => setState({ ...state, snackbar: 'Success! ' + (resp?.message || '')}))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const formatData = (data) => {
    const obj = {};
    data.forEach(pair => obj[pair.key] = pair.value);
    return obj;
  }

  const { classes, t } = props;
  const { snackbar, data, loading } = state;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  return (
    <ViewWrapper
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
    >
      <Paper className={classes.paper} elevation={1}>
        <Grid container>
          <Typography
            color="primary"
            variant="h5"
          >
            {t('editHeadline', { item: 'File' })}
          </Typography>
        </Grid>
        <FormControl className={classes.form}>
          {data.map((pair, idx) => <Grid container key={idx}>
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
          </Grid>
          )}
          {writable && <Grid container justifyContent="center">
            <IconButton onClick={handleAddRow} size="large">
              <Add color="primary"/>
            </IconButton>
          </Grid>}
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

DBFile.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (service, filename) => await dispatch(fetchServiceFile(service, filename))
      .then(file => file)
      .catch(message => Promise.reject(message)),
    edit: async (service, filename, file) => await dispatch(editServiceFile(service, filename, file))
      .then(file => file)
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(DBFile, styles)));
