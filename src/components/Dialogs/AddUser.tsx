// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import {
  Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, FormControlLabel, Checkbox,
  Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { addUserData, getStoreLangs } from '../../actions/users';
import { checkFormat } from '../../api';
import { fetchServersData } from '../../actions/servers';
import { fetchCreateParamsData } from '../../actions/defaults';
import { fetchDomainDetails } from '../../actions/domains';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { useNavigate } from 'react-router';
import { throttle } from 'lodash';
import { CapabilityContext } from '../../CapabilityContext';
import { selectableUserStatuses, SYSTEM_ADMIN_WRITE, USER_STATUS, USER_TYPE, userTypes } from '../../constants';
import { Domain } from '@/types/domains';
import { useAppDispatch, useAppSelector } from '../../store';
import { Server } from '@/types/servers';


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


type AddUserProps = {
  domain: Domain;
  open: boolean;
  onClose: () => void;
  onError: (error: string) => void;
  onSuccess: () => void;
}


const AddUser = (props: AddUserProps) => {
  const { domain, open, onClose, onError, onSuccess } = props;
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    username: '',
    properties: {
      displayname: '',
      storagequotalimit: '',
      displaytypeex: USER_TYPE.USER,
    },
    status: USER_STATUS.NORMAL,
    loading: false,
    password: '',
    repeatPw: '',
    homeserver: null,
    lang: 'en_US',
    chatAvailable: false,
    chat: false,
  });
  const [langs, setLangs] = useState([]);
  const config = useAppSelector((state) => state.config);
  const { Servers } = useAppSelector(state => state.servers);
  const { CreateParams } = useAppSelector(state => state.defaults);
  const [usernameError, setUsernameError] = useState(false);
  const navigate = useNavigate();
  const context = useContext(CapabilityContext);
  const isSystemAdmin = context.includes(SYSTEM_ADMIN_WRITE);

  const handleEnter = async () => {
    if(isSystemAdmin) dispatch(fetchServersData({ sort: 'hostname,asc', limit: 1000000, level: 0 }))
      .catch(error => props.onError(error));
    const langs = await dispatch(getStoreLangs())
      .catch();
    if(langs) setLangs(langs);
    dispatch(fetchCreateParamsData(null, {domain: domain.ID}))
      .catch(error => props.onError(error));
  }

  useEffect(() => {
    (async () => {
      const domainDetails = await dispatch(fetchDomainDetails(domain.ID));
      setState({
        ...state,
        chatAvailable: domainDetails.chat || false,
        ...getStateOverwrite(domainDetails.chat),
      });
    })();
  }, [CreateParams]);

  const getStateOverwrite = (chatAvailable) => {
    if(!CreateParams) return {};
    const user = CreateParams.user;
    const { lang, properties } = user || {};
    return {
      properties: {
        ...(properties || {}),
        storagequotalimit: properties?.storagequotalimit,
        prohibitreceivequota: properties?.prohibitreceivequota,
        prohibitsendquota: properties?.prohibitsendquota,
      },
      lang: lang || 'en_US',
      chat: chatAvailable ? (CreateParams.domain.chat || CreateParams.user.chat || false) : false,
    };
  }

  const handleInput = field => event => {
    setState({
      ...state, 
      [field]: event.target.value,
    });
  }

  const handleUsernameInput = event => {
    const { domain } = props;
    const val = event.target.value;
    if(val) debounceFetch({ email: encodeURIComponent(val + '@' + domain.domainname) });
    setState({
      ...state, 
      username: val,
    });
  }

  const debounceFetch = useCallback(throttle(async params => {
    const resp = await checkFormat(params)
      .catch(() => setState({ ...state, loading: false }));
    setUsernameError(!!resp?.email);
  }, 500), []);

  const handleCheckbox = field => event => setState({ ...state, [field]: event.target.checked });

  const handleAdd = () => {
    const { username, password, properties, status, homeserver, chat, lang } = state;
    // eslint-disable-next-line camelcase
    const { smtp, pop3_imap, changePassword,
      privChat, privVideo, privFiles, privArchive } = CreateParams.user;
    const checkboxes = status !== USER_STATUS.SHARED ?
    // eslint-disable-next-line camelcase
      { smtp, pop3_imap, changePassword, privChat, privVideo, privFiles, privArchive }
      : {};
    setState({ ...state, loading: true });
    dispatch(addUserData(domain.ID, {
      username,
      password: status === USER_STATUS.SHARED ? undefined : password,
      status,
      homeserver: homeserver?.ID || null,
      properties: {
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
      ...checkboxes,
      lang,
      chat,
    }))
      .then(() => {
        setState({
          ...state,
          username: '',
          properties: {
            displayname: '',
            storagequotalimit: '',
            displaytypeex: USER_TYPE.USER,
          },
          loading: false,
          password: '',
          repeatPw: '',
          homeserver: '',
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setState({ ...state, loading: false });
      });
  }

  const handleAddAndEdit = () => {
    const { username, password, properties, status, homeserver, chat, lang } = state;
    // eslint-disable-next-line camelcase
    const checkboxes = status !== USER_STATUS.SHARED ? CreateParams.user : {};
    setState({ ...state, loading: true });
    dispatch(addUserData(domain.ID, {
      username,
      password: status === USER_STATUS.SHARED ? undefined : password,
      status,
      homeserver: homeserver?.ID || null,
      properties: {
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
      ...checkboxes,
      lang,
      chat,
    }))
      .then(user => {
        navigate('/' + domain.ID + '/users/' + user.ID);
      })
      .catch(error => {
        onError(error);
        setState({ ...state, loading: false });
      });
  }

  const handlePropertyChange = field => event => {
    setState({
      ...state, 
      properties: {
        ...state.properties,
        [field]: event.target.value,
      },
    });
  }

  const handleAutocomplete = (field) => (e, newVal) => {
    setState({
      ...state, 
      [field]: newVal || '',
    });
  }

  const { username, loading, properties, password, repeatPw,
    status, homeserver, lang, chat, chatAvailable } = state;
  const { displayname, displaytypeex } = properties;
  const addDisabled = usernameError || !username || loading || 
      ((password !== repeatPw || (password.length < 6 && !config.devMode)) && status !== USER_STATUS.SHARED);
  return (
    (<Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
      TransitionProps={{
        onEnter: handleEnter,
      }}
      component="form"
    >
      <DialogTitle>{t('addHeadline', { item: 'User' })}</DialogTitle>
      <DialogContent>
        <FormControl className={classes.form}>
          <TextField
            select
            className={classes.input}
            label={t("Mode")}
            fullWidth
            value={status || USER_STATUS.NORMAL}
            onChange={handleInput('status')}
          >
            {selectableUserStatuses.map((status, key) => (
              <MenuItem key={key} value={status.ID}>
                {t(status.name)}
              </MenuItem>
            ))}
          </TextField>
          <TextField 
            label={t("Username")}
            value={username || ''}
            autoFocus
            onChange={handleUsernameInput}
            className={classes.input}
            required
            error={!!username && usernameError}
            slotProps={{
              input: {
                endAdornment: <div style={{ whiteSpace: 'nowrap' }}>@{domain.domainname}</div>,
              }
            }}
          />
          {status !== USER_STATUS.SHARED && <TextField 
            label={t("Password")}
            value={password || ''}
            onChange={handleInput('password')}
            className={classes.input}
            type="password"
            required
            helperText={(password && password.length < 6) ? t('Password must be at least 6 characters long') : ''}
            autoComplete="new-password"
            slotProps={{
              formHelperText: {
                error: true,
              }
            }}
          />}
          {status !== USER_STATUS.SHARED && <TextField 
            label={t("Repeat password")}
            value={repeatPw || ''}
            onChange={handleInput('repeatPw')}
            className={classes.input}
            type="password"
            required
            helperText={(repeatPw && password !== repeatPw) ? t("Passwords don't match") : ''}
            slotProps={{
              formHelperText: {
                error: true,
              }
            }}
          />}
          <TextField 
            label={t("Display name")}
            value={displayname || ''}
            onChange={handlePropertyChange('displayname')}
            className={classes.input}
          />
          <TextField
            select
            className={classes.input}
            label={t("Language")}
            fullWidth
            value={langs.length ? lang : ""}
            onChange={handleInput('lang')}
          >
            {langs.map((l) => (
              <MenuItem key={l.code} value={l.code}>
                {l.code + ": " + l.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            className={classes.input}
            label={t("Type")}
            fullWidth
            value={displaytypeex || USER_TYPE.USER}
            onChange={handlePropertyChange('displaytypeex')}
          >
            {userTypes.map((type, key) => (
              <MenuItem key={key} value={type.ID}>
                {t(type.name)}
              </MenuItem>
            ))}
          </TextField>
          {isSystemAdmin && <MagnitudeAutocomplete<Server>
            value={homeserver}
            filterAttribute={'hostname'}
            onChange={handleAutocomplete('homeserver')}
            className={classes.input} 
            options={Servers}
            label={t('Homeserver')}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
          />}
          <FormControlLabel
            control={
              <Checkbox
                checked={chat || false}
                onChange={handleCheckbox('chat')}
                color="primary"
              />
            }
            label={t('Create grommunio-chat User')}
            disabled={!chatAvailable}
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
          onClick={handleAddAndEdit}
          variant="contained"
          color="primary"
          disabled={addDisabled}
        >
          {loading ? <CircularProgress size={24}/> : t('Add and edit')}
        </Button>
        <Button
          type='submit'
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={addDisabled}
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>)
  );
}


export default AddUser;
