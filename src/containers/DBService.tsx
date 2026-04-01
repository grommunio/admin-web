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
  List,
  ListItemText,
  Divider,
  IconButton,
  ListItemButton,
  Theme,
} from '@mui/material';
import { fetchServiceFiles, renameDBService } from '../actions/dbconf';
import { getStringAfterLastSlash } from '../utils';
import { Delete } from '@mui/icons-material';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../store';
import DeleteServiceFile from '../components/Dialogs/DeleteServiceFile';
import { ChangeEvent } from '@/types/common';


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
  input: {
    marginBottom: theme.spacing(3),
  },
}));

const DBService = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    files: [],
    name: '',
    unsaved: false,
    deleting: "",
    loading: true,
    snackbar: "",
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const fetch = async (service: string) =>
    await dispatch(fetchServiceFiles(service));
  const rename = async (service: string, file: string) =>
    await dispatch(renameDBService(service, file));

  useEffect(() => {
    const inner = async () => {
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

  const handleInput = (field: string) => (e: ChangeEvent) => {
    setState({
      ...state, 
      [field]: e.target.value,
    });
  }

  const handleDelete = (file: string) => (event: React.MouseEvent) => {
    event.stopPropagation();
    setState({ ...state, deleting: file });
  }

  const handleDeleteSuccess = (message: string) => {
    const files = [...state.files].filter(f => f !== state.deleting);
    setState({ ...state, deleting: "", snackbar: 'Success! ' + (message || ''), files });
  }

  const handleDeleteClose = () => setState({ ...state, deleting: "" });

  const handleDeleteError = (error: string) => setState({ ...state, snackbar: error });

  const handleNavigation = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleEdit = () => {
    rename(getStringAfterLastSlash(), state.name)
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const { name, snackbar, files, deleting, loading } = state;
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
            {t('editHeadline', { item: 'Service' })}
          </Typography>
        </Grid2>
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
      <DeleteServiceFile
        open={!!deleting}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        file={deleting}
        service={name}
      />
    </ViewWrapper>
  );
}


export default DBService;
