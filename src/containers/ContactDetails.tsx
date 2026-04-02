// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Button, Divider, Grid2, Paper, TextField, Theme, Typography } from '@mui/material';
import ViewWrapper from '../components/ViewWrapper';
import { useTranslation } from 'react-i18next';
import User from '../components/user/User';
import Contact from '../components/user/Contact';
import { editUserData, fetchUserData } from '../actions/users';
import { useNavigate } from 'react-router';
import HideFromSelect from '../components/HideFromSelect';
import { useAppDispatch } from '../store';
import { UpdateUser, UserProperties } from '@/types/users';
import { ChangeEvent, DomainViewProps } from '@/types/common';


const useStyles = makeStyles()((theme: Theme) => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  header: {
    marginBottom: 16,
  },
  buttonGrid: {
    margin: theme.spacing(1, 0, 0, 1),
  },
  flexRow: {
    display: 'flex',
    margin: theme.spacing(0, 0, 2, 0),
  },
}));


interface ContactDetailsState {
  user: {
    ID: number;
    properties: Partial<UserProperties>;
  }
  snackbar: string;
  loading: boolean;
  unsaved: boolean;
}

const ContactDetails = ({ domain }: DomainViewProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState<ContactDetailsState>({
    user: {
      ID: -1,
      properties: {},
    },
    snackbar: "",
    loading: true,
    unsaved: false,
  });
  const navigate = useNavigate();

  const fetch = async (domainID: number, userID: number) => await dispatch(fetchUserData(domainID, userID));
  const edit = async (domainID: number, user: UpdateUser) => await dispatch(editUserData(domainID, user));

  useEffect(() => {
    const inner = async () => {
      const splits = window.location.pathname.split('/');
      const user = await fetch(parseInt(splits[1]), parseInt(splits[3]))
        .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
      if(!user) return;
      user.syncPolicy = user.syncPolicy || {};
      setState({ ...state, user, loading: false });
    };

    inner();
  }, []);

  const handlePropertyChange = (field: keyof UserProperties) => (event: ChangeEvent) => {
    const { user } = state;
    setState({
      ...state, 
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: event.target.value,
        },
      },
      unsaved: true,
    });
  }

  const handleEdit = () => {
    const { user } = state;
    const { properties } = user;

    edit(domain.ID, {
      ID: user.ID,
      properties: {
        ...properties,
        messagesizeextended: undefined,
        storagequotalimit: undefined,
        prohibitreceivequota: undefined,
        prohibitsendquota: undefined,
      },
    }).then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
  }

  const { snackbar, user, loading } = state;
  const { properties } = user;

  const { displayname, smtpaddress, attributehidden_gromox } = properties;

  return (
    <ViewWrapper
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
    >
      <Paper className={classes.paper} elevation={1}>
        <Grid2 container className={classes.header}>
          <Typography
            color="primary"
            variant="h5"
          >
            {t('editHeadline', { item: 'Contact' })} {displayname ? ` - ${displayname}` : ''}
          </Typography>
        </Grid2>
        <div className={classes.flexRow}>
          <Typography variant="h6">{t('E-Mail')}</Typography>
        </div>
        <TextField
          fullWidth
          label={t("E-Mail Address")}
          value={smtpaddress || ''}
          onChange={handlePropertyChange('smtpaddress')}
          sx={{ mb: 1 }}
        />
        <HideFromSelect attributehidden_gromox={attributehidden_gromox} setState={setState} />
        <User
          user={user}
          handlePropertyChange={handlePropertyChange}
        />
        <Divider />
        <Contact
          user={user}
          handlePropertyChange={handlePropertyChange}
        />
        <Grid2 container className={classes.buttonGrid}>
          <Button
            onClick={() => navigate(-1)}
            style={{ marginRight: 8 }}
            color="secondary"
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEdit}
          >
            {t('Save')}
          </Button>
        </Grid2>
      </Paper>
    </ViewWrapper>
  );
}


export default ContactDetails;
