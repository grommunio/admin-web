// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress,
  Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { addFolderData } from '../../actions/folders';
import { fetchAllUsers, fetchUsersData } from '../../actions/users';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { folderTypes } from '../../constants';
import { Domain } from '@/types/domains';
import { useAppDispatch, useAppSelector } from '../../store';
import { NewFolder } from '@/types/folders';
import { ChangeEvent } from '@/types/common';
import { UserListItem } from '@/types/users';


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
}));


type AddFolderProps = {
  open: boolean;
  domain: Domain;
  parentID: string;
  onError: (err: string) => void;
  onSuccess: () => void;
  onClose: () => void;
}

const AddFolder = (props: AddFolderProps) => {
  const { open, onClose, onSuccess, onError, domain, parentID } = props;
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [folder, setFolder] = useState<NewFolder>({
    displayname: '',
    container: 'IPF.Note',
    owners: [],
    comment: '',
    parentID: parentID,
  });
  const [ owners, setOwners ] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { Users } = useAppSelector(state => state.users);

  useEffect(() => {
    if(domain.orgID) {
      dispatch(fetchAllUsers({ limit: 100000, sort: "username,asc", orgID: domain.orgID }))
        .catch();
    } else {
      dispatch(fetchUsersData(domain.ID, { limit: 100000, sort: "username,asc" }))
        .catch();
    }
  }, []);

  useEffect(() => {
    setFolder({ ...folder, parentID });
  }, [parentID]);

  const handleInput = (field: keyof NewFolder) => (event: ChangeEvent) => {
    setFolder({
      ...folder,
      [field]: event.target.value,
    });
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    dispatch(addFolderData(domain.ID, { ...folder }, owners))
      .then(() => {
        setFolder({
          ...folder,
          displayname: '',
          container: 'IPF.Note',
          comment: '',
        });
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAutocomplete = (_: unknown, newVal: UserListItem[]) => {
    setOwners(newVal);
  }

  const { displayname, container, comment } = folder;
  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('addHeadline', { item: 'Folder' })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <TextField 
            label={t("Folder name")}
            value={displayname}
            onChange={handleInput('displayname')}
            className={classes.input}
            autoFocus
            required
          />
          <TextField
            select
            className={classes.input}
            label={t("Container")}
            fullWidth
            value={container || ''}
            onChange={handleInput('container')}
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
            rows={4}
            value={comment}
            variant="outlined"
            onChange={handleInput('comment')}
          />
          <MagnitudeAutocomplete<UserListItem>
            multiple
            value={owners || []}
            filterAttribute={'username'}
            onChange={handleAutocomplete}
            className={classes.input} 
            options={Users || []}
            label={t('Owners')}
            placeholder={t("Search users")  + "..."}
            getOptionKey={(option: UserListItem) => `${option.ID}_${option.domainID}`}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={!displayname || loading}
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddFolder;
