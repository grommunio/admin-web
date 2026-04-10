// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, FormControl, Grid2, Theme, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { fetchPermittedUsers, fetchUserDelegates, fetchPlainUsersData, setUserDelegates,
  setPermittedUserData, 
  fetchUserSendAs, 
  setUserSendAs,
  fetchAllUsers} from '../../actions/users';
import Feedback from '../Feedback';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { CapabilityContext } from '../../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../../constants';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../store';
import { ChangeEvent } from '@/types/common';
import { BaseUser, USER_STATUS } from '../../types/users';


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1, 1, 1, 1),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  buttonGrid: {
    margin: theme.spacing(1, 0, 0, 1),
  },
}));

type DeletesProps = {
  domainID: number
  orgID?: number | null;
  userID: number;
  disabled: boolean;
}

const Delegates = (props: DeletesProps) => {
  const { userID, domainID, orgID, disabled } = props;
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Users } = useAppSelector(state => state.users);
  const [state, setState] = useState({
    delegates: [],
    sendAsUsers: [],
    permittedUsers: [],
    snackbar: '',
    delegatesACInput: '',
    sendAsACInput: '',
    puACInput: '',
    dEdited: false,
    sEdited: false,
    puEdited: false,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const fetchDelegates = async (domainID: number, userID: number) => await dispatch(fetchUserDelegates(domainID, userID));
  const fetchSendAs = async (domainID: number, userID: number) => await dispatch(fetchUserSendAs(domainID, userID));
  const fetchPermitted = async (domainID: number, userID: number) => await dispatch(fetchPermittedUsers(domainID, userID));
  const fetchUsers = async (domainID: number) => await dispatch(fetchPlainUsersData(domainID, { status: USER_STATUS.NORMAL }));
  const fetchOrgUsers = async (orgID: number) =>
    await dispatch(fetchAllUsers({orgID, limit: 1000000, sort: 'username,asc', level: 0, status: USER_STATUS.NORMAL }));
  const setDelegates = async (domainID: number, userID: number, delegates: string[]) =>
    await dispatch(setUserDelegates(domainID, userID, delegates));
  const setSendAs = async (domainID: number, userID: number, sendAsUsers: string[]) =>
    await dispatch(setUserSendAs(domainID, userID, sendAsUsers));
  const setPermittedUser = async (domainID: number, folderID: number, permittedUsers: { usernames: string[] }) => 
    await dispatch(setPermittedUserData(domainID, folderID, permittedUsers));

  useEffect(() => {
    const fetchData = async () => {
      const sysAdminPermissions = context.includes(SYSTEM_ADMIN_WRITE);
  
      (sysAdminPermissions && orgID ? fetchOrgUsers(orgID) : fetchUsers(domainID))
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      const delegates = await fetchDelegates(domainID, userID)
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      const sendAsUsers = await fetchSendAs(domainID, userID)
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      const permittedUsers = await fetchPermitted(domainID, userID)
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      setState({
        ...state, 
        delegates: delegates?.data?.sort() || [],
        permittedUsers: permittedUsers?.data?.map((u: BaseUser) => u.username).sort() || [],
        sendAsUsers: sendAsUsers?.data?.sort() || [],
      });
    }

    fetchData();
  }, []);

  const handleInput = (field: string) => (event: ChangeEvent) => {
    setState({
      ...state, 
      [field]: event.target.value,
    });
  }

  const handleAutocomplete = (field: string, editField: keyof typeof state) => (_: unknown, newVal: string[]) => {
    setState({
      ...state, 
      [field]: newVal.sort(),
      [editField]: true,
      delegatesACInput: '',
      sendAsACInput: '',
      puACInput: '',
    });
  }

  const handleSave = () => {
    const { delegates, permittedUsers, sendAsUsers, dEdited, sEdited, puEdited } = state;
    if(dEdited) setDelegates(domainID, userID, delegates)
      .then(() => setState({
        ...state, 
        snackbar: 'Success!',
        delegatesACInput: '',
        puACInput: '',
        sendAsACInput: '',
      })).catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));

    if(sEdited) setSendAs(domainID, userID, sendAsUsers)
      .then(() => setState({
        ...state, 
        snackbar: 'Success!',
        delegatesACInput: '',
        puACInput: '',
        sendAsACInput: '',
      })).catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
    
    if(puEdited) setPermittedUser(domainID, userID, {
      usernames: permittedUsers,
    })
      .then(() => setState({
        ...state, 
        snackbar: 'Success!',
        delegatesACInput: '',
        puACInput: '',
        sendAsACInput: '',
      })).catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const { delegates, sendAsUsers, snackbar, delegatesACInput, puACInput, permittedUsers, sendAsACInput } = state;
  const defaultTfProps = useMemo(() => ({
    multiple: true,
    //filterAttribute: 'username',
    className: classes.input,
    options: Users.filter((u: BaseUser) => u.ID !== userID).map((u: BaseUser) => u.username) || [],
    //isOptionEqualToValue: (option: BaseUser, value: string) => option.username === value,
    //getOptionLabel: (user: BaseUser) => user.username,
    placeholder: t("Search users") + "...",
  }), [Users]);

  return (
    <>
      <FormControl className={classes.form}>
        <Typography variant="h6" className={classes.headline}>{t('Mailbox permissions')}</Typography>
        <FormControl className={classes.input}>
          <MagnitudeAutocomplete
            {...defaultTfProps}
            value={delegates || []}
            inputValue={delegatesACInput}
            onChange={handleAutocomplete('delegates', 'dEdited')}
            onInputChange={handleInput('delegatesACInput')}
            label={t('Delegates')}
            helperText={t("Users who may send mails on behalf of this mailbox")}
          />
          <MagnitudeAutocomplete
            {...defaultTfProps}
            value={sendAsUsers || []}
            inputValue={sendAsACInput}
            onChange={handleAutocomplete('sendAsUsers', 'sEdited')}
            onInputChange={handleInput('sendAsACInput')}
            label={t('Send as / Impersonators')}
            helperText={t("Users who may send mails as this mailbox")}
          />
          <MagnitudeAutocomplete
            {...defaultTfProps}
            value={permittedUsers || []}
            inputValue={puACInput}
            onChange={handleAutocomplete('permittedUsers', 'puEdited')}
            onInputChange={handleInput('puACInput')}
            label={t('Additional store owners')}
            helperText={t("Users who get read-write access to all objects")}
          />
        </FormControl>
      </FormControl>
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
          onClick={handleSave}
          disabled={disabled}
        >
          {t('Save')}
        </Button>
      </Grid2>
      <Feedback
        snackbar={snackbar}
        onClose={() => setState({ ...state, snackbar: '' })}
      />
    </>
  );
}


export default Delegates;
