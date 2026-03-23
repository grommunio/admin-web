// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, TextField,
  Button, DialogActions, CircularProgress, Grid2,
  Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { addContactData } from '../../actions/users';
import { useNavigate } from 'react-router';
import { USER_STATUS } from '../../constants';
import { BaseDomain } from '@/types/domains';
import { useAppDispatch } from '../../store';
import { UserProperties } from '@/types/users';
import { ChangeEvent } from '@/types/common';


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


type AddContactProps = {
  domain: BaseDomain;
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

const AddContact = (props: AddContactProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [contact, setContact] = useState(defaultState);
  const { open, onClose } = props;
  const { smtpaddress, displayname, givenname, initials, surname, nickname } = contact;
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const { domain, onError, onSuccess } = props;
    setLoading(true);
    dispatch(addContactData(domain.ID, {
      status: USER_STATUS.CONTACT,
      properties: {
        ...contact,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
    }))
      .then(() => {
        setContact({ displayname: '' })
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAddAndEdit = () => {
    const { domain, onError } = props;
    setLoading(true);
    dispatch(addContactData(domain.ID, {
      status: USER_STATUS.CONTACT,
      properties: {
        ...contact,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
    }))
      .then(user => {
        navigate('/' + domain.ID + '/contacts/' + user.ID);
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handlePropertyChange = (field: keyof UserProperties) => (event: ChangeEvent) => {
    setContact(contact => ({ ...contact, [field]: event.target.value }));
  }

  return (
    (<Dialog
      onClose={onClose}
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>{t('addHeadline', { item: 'Contact' })}</DialogTitle>
      <DialogContent>
        <Grid2 container>
          <Grid2 className={classes.gridItem} size={12}>
            <TextField
              className={classes.propertyInput}
              fullWidth
              label={t("E-Mail Address")}
              value={smtpaddress || ''}
              onChange={handlePropertyChange('smtpaddress')}
            />
          </Grid2>
          <Grid2 className={classes.gridItem} size={12}>
            <div className={classes.grid}>
              <TextField 
                className={classes.flexTextfield}
                label={t("First name")}
                value={givenname || ''}
                onChange={handlePropertyChange('givenname')}
              />
              <TextField 
                label={t("Initials")}
                value={initials || ''}
                onChange={handlePropertyChange('initials')}
              />
            </div>
            <TextField 
              className={classes.propertyInput} 
              label={t("Surname")} 
              fullWidth 
              value={surname || ''}
              onChange={handlePropertyChange('surname')}
            />
          </Grid2>
          <Grid2 className={classes.gridItem} size={12}>
            <TextField 
              className={classes.propertyInput}
              label={t("Display name")}
              fullWidth
              value={displayname || ''}
              onChange={handlePropertyChange('displayname')}
            />
            <TextField 
              className={classes.propertyInput} 
              label={t("Nickname")} 
              fullWidth 
              value={nickname || ''}
              onChange={handlePropertyChange('nickname')}
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


export default AddContact;
