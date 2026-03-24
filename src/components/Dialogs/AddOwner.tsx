// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl,
  Button, DialogActions, CircularProgress,
  Theme, 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { addOwnerData } from '../../actions/folders';
import { fetchAllUsers, fetchUsersData } from '../../actions/users';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { Domain } from '@/types/domains';
import { useAppDispatch, useAppSelector } from '../../store';
import { User } from '@/types/users';


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

type AddOwnerProps = {
  open: boolean;
  folderID: string;
  domain: Domain;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

const AddOwner = (props: AddOwnerProps) => {
  const { open, domain, folderID, onSuccess, onError, onCancel } = props;
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Users } = useAppSelector(state => state.users);
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(domain.orgID) {
      dispatch(fetchAllUsers({ limit: 100000, sort: "username,asc", orgID: domain.orgID }))
        .catch();
    } else {
      dispatch(fetchUsersData(domain.ID, { limit: 100000, sort: "username,asc" }))
        .catch();
    }
  }, []);

  const handleAdd = () => {
    setLoading(true);
    dispatch(addOwnerData(domain.ID, folderID, owners))
      .then(() => {
        setOwners([]);
        onSuccess();
        setLoading(false);
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAutocomplete = (_: never, newVal: User[]) => {
    setOwners(newVal);
  }

  return (
    <Dialog
      onClose={onCancel}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('addHeadline', { item: 'Owner' })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <MagnitudeAutocomplete<User>
            multiple
            value={owners || []}
            filterAttribute={'username'}
            onChange={handleAutocomplete}
            className={classes.input} 
            options={Users || []}
            placeholder={t("Search users") +  "..."}
            label={t('Owners')}
            isOptionEqualToValue={(option, value) => option.ID === value.ID && option.domainID === value.domainID}
            getOptionKey={(option) => `${option.ID}_${option.domainID}`}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={owners.length === 0 || loading}
        >
          {loading ? <CircularProgress size={24}/> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddOwner;
