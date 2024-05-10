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
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from '@mui/material';
import { connect } from 'react-redux';
import { fetchFolderDetails, addFolderData, fetchOwnersData, editFolderData } from '../actions/folders';
import { DOMAIN_ADMIN_WRITE, IPM_SUBTREE_ID, IPM_SUBTREE_OBJECT } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import FolderPermissions from '../components/Dialogs/FolderPermissions';
import { Info } from '@mui/icons-material';
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
    marginBottom: theme.spacing(2),
  },
  grid: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkbox: {
    marginLeft: 8,
  },
  flexBox: {
    display: 'flex',
  },
  infoIcon: {
    marginLeft: 8,
  }
});

const FolderDetails = props => {
  const [state, setState] = useState({
    folder: {},
    readonly: true,
    adding: false,
    snackbar: '',
    loading: true,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const types = [
    { name: 'Mail and post items', ID: 'IPF.Note' },
    { name: 'Contact', ID: 'IPF.Contact' },
    { name: 'Appointment', ID: 'IPF.Appointment' },
    { name: 'Sticky note', ID: 'IPF.Stickynote' },
    { name: 'Task', ID: 'IPF.Task' },
  ]

  useEffect(() => {
    const inner = async () => {
      const { fetch, fetchOwners } = props;
      const splits = window.location.pathname.split('/');
      const folderId = splits[3];
      // If folder is IPM_SUBTREE
      if(folderId === IPM_SUBTREE_ID) {
        setState({ ...state, folder: IPM_SUBTREE_OBJECT, readonly: true, loading: false });
        await fetchOwners(splits[1], IPM_SUBTREE_ID);
      } else {
        const folder = await fetch(splits[1], folderId);
        setState({ ...state, folder: folder, readonly: false, loading: false });
        await fetchOwners(splits[1], folder.folderid);
      }
    };

    inner();
  }, []);

  const handleInput = field => event => {
    setState({
      ...state,
      folder: {
        ...state.folder,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  const handleCheckbox = field => e => {
    setState({
      ...state, 
      folder: {
        ...state.folder,
        [field]: e.target.checked,
      },
      unsaved: true,
    });
  }

  const handleEdit = () => {
    const { domain } = props;
    const { folder } = state;
    props.edit(domain.ID, {
      ...folder,
      creationtime: undefined,
    })
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const handleAdd = () => setState({ ...state, adding: true });

  const handlePermissionsSuccess = () => setState({ ...state, snackbar: "Success!" });

  const handlePermissionsError = error => setState({ ...state, snackbar: error });

  const handlePermissionsCancel = () => setState({ ...state, adding: false });

  const { classes, t, domain } = props;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  const { folder, adding, snackbar, readonly, loading } = state;

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
            {t('Folder details')}
          </Typography>
        </Grid>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Folder name")} 
            fullWidth 
            value={folder.displayname || ''}
            autoFocus
            onChange={handleInput('displayname')}
            disabled={readonly}
          />
          <TextField
            select
            className={classes.input}
            label={t("Container")}
            fullWidth
            value={folder.container || 'IPF.Note'}
            onChange={handleInput('container')}
            disabled={readonly}
          >
            {types.map((type, key) => (
              <MenuItem key={key} value={type.ID}>
                {t(type.name)}
              </MenuItem>
            ))}
          </TextField>
          <TextField 
            className={classes.input} 
            label={t("Comment")} 
            fullWidth
            multiline
            variant="outlined"
            rows={4}
            value={folder.comment || ''}
            onChange={handleInput('comment')}
            disabled={readonly}
          />
        </FormControl>
        <Grid container className={classes.grid} alignItems="center">
          <Button
            onClick={handleAdd}
            disabled={!writable}
            size="large"
            variant='outlined'
          >
            {t('Open permissions')}
          </Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={folder.syncMobile || false}
                onChange={handleCheckbox('syncMobile')}
                color="primary"
              />
            }
            className={classes.checkbox}
            label={<span className={classes.flexBox}>
              {t('Sync on mobile devices')}
              <Tooltip placement='top' title={t("sync_warning")}>
                <Info className={classes.infoIcon}/>
              </Tooltip>
            </span>}
          />
        </Grid>
        <Grid container>
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
            style={{ marginRight: 8 }}
            disabled={!writable || readonly}
          >
            {t('Save')}
          </Button>
        </Grid>
      </Paper>
      {folder.folderid && <FolderPermissions
        open={adding}
        onSuccess={handlePermissionsSuccess}
        onError={handlePermissionsError}
        onCancel={handlePermissionsCancel}
        domain={domain}
        folderID={folder.folderid}
      />}
    </ViewWrapper>
  );
}

FolderDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  add: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchOwners: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, folderID) => await dispatch(fetchFolderDetails(domainID, folderID))
      .then(folder => folder)
      .catch(msg => Promise.reject(msg)),
    edit: async (domainID, folder) => await dispatch(editFolderData(domainID, folder))
      .catch(msg => Promise.reject(msg)),
    add: async (domainID, folder) => {
      await dispatch(addFolderData(domainID, folder)).catch(msg => Promise.reject(msg));
    },
    fetchOwners: async (domainID, folderID) => {
      await dispatch(fetchOwnersData(domainID, folderID, { limit: 1000000, level: 0 }))
        .catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(FolderDetails, styles)));
