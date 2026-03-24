// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, TextField,
  Button, DialogActions, CircularProgress, Grid2, FormControl,
  Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { addContactData } from '../../actions/users';
import { fetchDomainData } from '../../actions/domains';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { useNavigate } from 'react-router';
import { USER_STATUS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store';
import { UserProperties } from '@/types/users';
import { ChangeEvent } from '@/types/common';
import { BaseDomain } from '@/types/domains';


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  grid: {
    display: 'flex',
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  gridItem: {
    display: 'flex',
  },
  propertyInput: {
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
  flexTextfield: {
    flex: 1,
    marginRight: 8,
  },
}));

type AddGlobalContactProps = {
  open: boolean;
  onClose: () => void;
  onError: (error: string) => void;
  onSuccess: () => void;
}

const defaultState: Partial<UserProperties> = {
  smtpaddress: '',
  displayname: '',
  givenname: '',
  initials: '',
  surname: '',
  nickname: '',
}

const AddGlobalContact = (props: AddGlobalContactProps) => {
  const [contact, setContact] = useState(defaultState);
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Domains } = useAppSelector(state => state.domains);

  const handleEnter = () => {
    const { onError } = props;
    dispatch(fetchDomainData({ limit: 1000000, level: 0, sort: 'domainname,asc' }))
      .catch(error => onError(error));
  }

  const handleInput = (field: keyof typeof defaultState) => (event: ChangeEvent) => {
    setContact({
      ...contact,
      [field]: event.target.value,
    });
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const { onError, onSuccess } = props;
    setLoading(true);
    dispatch(addContactData(domain?.ID || -1, {
      status: USER_STATUS.CONTACT,
      properties: {
        ...contact,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
    }))
      .then(() => {
        setContact({ displayname: '' });
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAddAndEdit = () => {
    const { onError } = props;
    setLoading(true);
    dispatch(addContactData(domain?.ID || -1, {
      status: USER_STATUS.CONTACT,
      properties: {
        ...contact,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
    }))
      .then(user => {
        navigate('/' + domain?.ID + '/contacts/' + user.ID);
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAutocomplete = (_: unknown, newVal: BaseDomain) => {
    setDomain(newVal || '');
  }

  const { open, onClose } = props;
  const { smtpaddress, displayname, givenname, initials, surname, nickname } = contact;

  return (
    (<Dialog
      onClose={onClose}
      open={open}
      maxWidth="lg"
      fullWidth
      TransitionProps={{
        onEnter: handleEnter,
      }}
    >
      <DialogTitle>{t('addHeadline', { item: 'Contact' })}</DialogTitle>
      <DialogContent>
        <Grid2 container>
          <FormControl className={classes.form}>
            <MagnitudeAutocomplete<BaseDomain>
              value={domain}
              filterAttribute={'domainname'}
              onChange={handleAutocomplete}
              options={Domains}
              label={t('Domain')}
              placeholder={t("Search domains")  + "..."}
              autoFocus
              autoSelect
              isOptionEqualToValue={(option, value) => option.ID === value.ID}
            />
          </FormControl>
          <Grid2 className={classes.gridItem} size={12}>
            <TextField
              className={classes.propertyInput}
              fullWidth
              label={t("E-Mail Address")}
              value={smtpaddress || ''}
              onChange={handleInput('smtpaddress')}
            />
          </Grid2>
          <Grid2 className={classes.gridItem} size={12}>
            <div className={classes.grid}>
              <TextField 
                className={classes.flexTextfield}
                label={t("First name")}
                value={givenname || ''}
                onChange={handleInput('givenname')}
              />
              <TextField 
                //className={classes.flexTextfield}
                label={t("Initials")}
                value={initials || ''}
                onChange={handleInput('initials')}
              />
            </div>
            <TextField 
              className={classes.propertyInput} 
              label={t("Surname")} 
              fullWidth 
              value={surname || ''}
              onChange={handleInput('surname')}
            />
          </Grid2>
          <Grid2 className={classes.gridItem} size={12}>
            <TextField 
              className={classes.propertyInput}
              label={t("Display name")}
              fullWidth
              value={displayname || ''}
              onChange={handleInput('displayname')}
            />
            <TextField 
              className={classes.propertyInput} 
              label={t("Nickname")} 
              fullWidth 
              value={nickname || ''}
              onChange={handleInput('nickname')}
            />
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleAddAndEdit}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress size={24}/> : t('Add and edit')}
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>)
  );
}


export default AddGlobalContact;
