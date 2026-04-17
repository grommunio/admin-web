// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { addOrgData } from '../../actions/orgs';
import { fetchDomainData, fetchDrawerDomains } from '../../actions/domains';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { useAppDispatch, useAppSelector } from '../../store';
import { NewOrg } from '@/types/orgs';
import { ChangeEvent, SyntheticEvent } from '@/types/common';
import { BaseDomain, Domain } from '@/types/domains';


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


type AddOrgProps = {
  open: boolean;
  onClose: () => void;
  onError: (error: string) => void;
  onSuccess: () => void;
}


const AddOrg = (props: AddOrgProps) => {
  const { open, onClose } = props;
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { Domains } = useAppSelector(state => state.domains);
  const dispatch = useAppDispatch();
  const [org, setOrg] = useState({
    name: '',
    description: '',
    domains: [],
  });
  const [loading, setLoading] = useState(false);

  const handleEnter = () => {
    dispatch(fetchDomainData({ limit: 1000000, level: 0, sort: 'domainname,asc' }));
  }

  const handleInput = (field: keyof NewOrg) => (event: ChangeEvent) => {
    setOrg({
      ...org,
      [field]: event.target.value,
    });
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const { onSuccess, onError } = props;
    const { name, description, domains } = org;
    setLoading(true);
    dispatch(addOrgData({
      name,
      description,
      domains: domains.map((d: Domain) => d.ID),
    }))
      .then(() => {

        // Refetch drawer domains so the routes have knowledge about org updates
        dispatch(fetchDrawerDomains());

        setOrg({
          name: '',
          description: '',
          domains: [],
        });
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAutocomplete = (field: keyof NewOrg) => (_: SyntheticEvent, newVal: BaseDomain[]) => {
    setOrg({
      ...org,
      [field]: newVal,
    });
  }

  const { name, description, domains } = org;
  const nameAcceptable = name && name.length < 33;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
      TransitionProps={{
        onEnter: handleEnter,
      }}>
      <DialogTitle>{t('addHeadline', { item: 'Organization' })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Name")} 
            fullWidth 
            value={name || ''}
            onChange={handleInput('name')}
            autoFocus
            required
            error={Boolean(name && !nameAcceptable)}
          />
          <TextField 
            className={classes.input} 
            label={t("Description")} 
            fullWidth 
            value={description || ''}
            onChange={handleInput('description')}
            multiline
            rows={4}
            variant="outlined"
          />
          <MagnitudeAutocomplete<BaseDomain>
            value={domains}
            filterAttribute={'domainname'}
            onChange={handleAutocomplete('domains')}
            className={classes.input} 
            options={Domains || []}
            label={t('Domains')}
            placeholder={t("Search domains") + "..."}
            multiple
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
          />
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
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={loading || !nameAcceptable}
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default AddOrg;
