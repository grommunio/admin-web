// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  List,
  ListItemText,
  Divider,
  IconButton,
  ListItemButton,
} from '@mui/material';
import { connect } from 'react-redux';
import { fetchServiceFiles, deleteDBFile, renameDBService } from '../actions/dbconf';
import { getStringAfterLastSlash } from '../utils';
import { Delete } from '@mui/icons-material';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
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
  input: {
    marginBottom: theme.spacing(3),
  },
});

const DBService = props => {
  const [state, setState] = useState({
    files: [],
    name: '',
    unsaved: false,
    deleting: false,
    loading: true,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  useEffect(() => {
    const inner = async () => {
      const { fetch } = props;
      const name = getStringAfterLastSlash();
      const files = await fetch(name)
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      setState({
        ...state,
        files: files?.data || [],
        name: name || '',
        loading: false,
      });
    };

    inner();
  }, []);

  const handleInput = field => e => {
    setState({
      ...state, 
      [field]: e.target.value,
    });
  }

  const handleDelete = file => event => {
    event.stopPropagation();
    setState({ ...state, deleting: file });
  }

  const handleDeleteSuccess = resp => {
    const files = [...state.files].filter(f => f !== state.deleting);
    setState({ ...state, deleting: false, snackbar: 'Success! ' + (resp?.message || ''), files });
  }

  const handleDeleteClose = () => setState({ ...state, deleting: false });

  const handleDeleteError = error => setState({ ...state, snackbar: error });

  const handleNavigation = path => event => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleEdit = () => {
    props.rename(getStringAfterLastSlash(), state.name)
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const { classes, t } = props;
  const { name, snackbar, files, deleting, loading } = state;
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
            {t('editHeadline', { item: 'Service' })}
          </Typography>
        </Grid>
        <FormControl className={classes.form}>
          <TextField
            label={t("Service")} 
            className={classes.input} 
            value={name || ''}
            autoFocus
            onChange={handleInput('name')}
          />
        </FormControl>
        <Typography variant="h6">Files</Typography>
        <List>
          {files.map((file, idx) => <React.Fragment key={idx}>
            <ListItemButton onClick={handleNavigation(`dbconf/${name}/${file}`)}>
              <ListItemText
                primary={file}
              />
              {writable && <IconButton onClick={handleDelete(file)} size="large">
                <Delete color="error" />
              </IconButton>}
            </ListItemButton>
            <Divider />
          </React.Fragment>
          )}
        </List>
        <Button
          color="secondary"
          onClick={handleNavigation('dbconf')}
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
      <DomainDataDelete
        open={!!deleting}
        delete={props.delete}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        item={deleting}
        id={deleting}
        domainID={name}
      />
    </ViewWrapper>
  );
}

DBService.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  rename: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (service) => await dispatch(fetchServiceFiles(service))
      .then(files => files)
      .catch(message => Promise.reject(message)),
    delete: async (service, file) => await dispatch(deleteDBFile(service, file))
      .then(msg => msg)
      .catch(message => Promise.reject(message)),
    rename: async (service, file) => await dispatch(renameDBService(service, file))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DBService)));
