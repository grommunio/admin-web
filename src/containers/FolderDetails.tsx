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
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Theme,
} from '@mui/material';
import { fetchFolderDetails, fetchOwnersData, editFolderData } from '../actions/folders';
import { DOMAIN_ADMIN_WRITE, folderTypes, IPM_SUBTREE_ID, IPM_SUBTREE_OBJECT, IPM_SUBTREE_OBJECT_TYPE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import FolderPermissions from '../components/Dialogs/FolderPermissions';
import { Info } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../store';
import { DomainViewProps } from '@/types/common';
import { Folder, UpdateFolder } from '@/types/folders';


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
}));

const FolderDetails = ({ domain }: DomainViewProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    folder: {} as Folder | IPM_SUBTREE_OBJECT_TYPE,
    readonly: true,
    adding: false,
    snackbar: '',
    loading: true,
    unsaved: false,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const fetch = async (domainID: number, folderID: string) => await dispatch(fetchFolderDetails(domainID, folderID));
  const edit = async (domainID: number, folder: UpdateFolder) => await dispatch(editFolderData(domainID, folder));
  const fetchOwners = async (domainID: number, folderID: string) =>
    await dispatch(fetchOwnersData(domainID, folderID, { limit: 1000000, level: 0 }));

  useEffect(() => {
    const inner = async () => {
      const splits = window.location.pathname.split('/');
      const folderId = splits[3];
      // If folder is IPM_SUBTREE
      if(folderId === IPM_SUBTREE_ID) {
        setState({ ...state, folder: IPM_SUBTREE_OBJECT, readonly: true, loading: false });
        await fetchOwners(domain.ID, IPM_SUBTREE_ID);
      } else {
        const folder = await fetch(domain.ID, folderId);
        setState({ ...state, folder: folder, readonly: false, loading: false });
        await fetchOwners(domain.ID, folder.folderid);
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
    const { folder } = state;
    edit(domain.ID, {
      ...folder,
      creationtime: undefined,
    })
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const handleAdd = () => setState({ ...state, adding: true });

  const handlePermissionsSuccess = () => setState({ ...state, snackbar: "Success!" });

  const handlePermissionsError = (error: string) => setState({ ...state, snackbar: error });

  const handlePermissionsCancel = () => setState({ ...state, adding: false });

  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  const { folder, adding, snackbar, readonly, loading } = state;

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
            {t('Folder details')}
          </Typography>
        </Grid2>
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
            {folderTypes.map((type, key) => (
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
        <Grid2 container className={classes.grid} alignItems="center">
          <Button
            onClick={handleAdd}
            disabled={!writable}
            size="large"
            variant='outlined'
          >
            {t('Open permissions')}
          </Button>
          {folder.folderid !== IPM_SUBTREE_ID &&
          <FormControlLabel
            control={
              <Checkbox
                checked={(folder as Folder).syncMobile || false}
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
          />}
        </Grid2>
        <Grid2 container>
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
        </Grid2>
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


export default FolderDetails;
