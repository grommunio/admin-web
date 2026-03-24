// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, FormControlLabel, Checkbox,
  Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { fetchDomainData, fetchDomainDetails } from '../../actions/domains';
import { addUserData, getStoreLangs } from '../../actions/users';
import { checkFormat } from '../../api';
import { fetchServersData } from '../../actions/servers';
import { fetchCreateParamsData } from '../../actions/defaults';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { useNavigate } from 'react-router';
import { throttle } from 'lodash';
import { selectableUserStatuses, USER_STATUS, USER_TYPE, userTypes } from '../../constants';
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
  noWrap: {
    whiteSpace: 'nowrap',
  },
}));


type AddGlobalUserProps = {
  open: boolean;
  onClose: () => void;
  onError: (error: string) => void;
  onSuccess: () => void;
}
 

const AddGlobalUser = (props: AddGlobalUserProps) => {
  const { open, onClose, onError, onSuccess } = props;
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
    domain: null,
    homeserver: null,
    lang: 'en_US',
    chat: false,
    chatAvailable: false,
  });
  const [langs, setLangs] = useState([]);
  const config = useAppSelector((state) => state.config);
  const { Domains } = useAppSelector(state => state.domains);
  const { Servers } = useAppSelector(state => state.servers);
  const [usernameError, setUsernameError] = useState(false);
  const navigate = useNavigate();
  const { CreateParams } = useAppSelector(state => state.defaults);

  const handleEnter = async () => {
    dispatch(fetchDomainData({ limit: 1000000, level: 0, sort: 'domainname,asc' }))
      .catch(error => onError(error));
    dispatch(fetchServersData({ sort: 'hostname,asc', limit: 1000000, level: 0 }))
      .catch(error => onError(error));
    dispatch(fetchCreateParamsData())
      .catch(error => onError(error));
    const langs = await dispatch(getStoreLangs())
      .catch();
    if(langs) setLangs(langs);
  }

  useEffect(() => {
    setState(getStateOverwrite());
  }, [CreateParams]);

  const getStateOverwrite = () => {
    if(!CreateParams) return state;
    const user = CreateParams.user;
    const { lang, chat, properties } = user || {};
    return {
      ...state,
      properties: {
        ...(properties || {}),
        storagequotalimit: properties?.storagequotalimit,
        prohibitreceivequota: properties?.prohibitreceivequota,
        prohibitsendquota: properties?.prohibitsendquota,
      },
      chat: chat || false,
      lang: lang || 'en_US',
    };
  }

  const handleInput = field => event => {
    setState({
      ...state,
      [field]: event.target.value,
    });
  }

  const handleUsernameInput = event => {
    const { domain } = state;
    const val = event.target.value;
    if(val && domain) debounceFetch({ email: encodeURIComponent(val + '@' + domain?.domainname) });
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

  const handleAdd = e => {
    e.preventDefault();
    const { username, password, properties, domain, status, homeserver, chat, lang } = state;
    // eslint-disable-next-line camelcase
    const { smtp, pop3_imap, changePassword,
      privChat, privVideo, privFiles, privArchive } = CreateParams.user;
    const checkboxes = status !== USER_STATUS.SHARED ?
    // eslint-disable-next-line camelcase
      { smtp, pop3_imap, changePassword, privChat, privVideo, privFiles, privArchive }
      : {};
    setState({ ...state, loading: true });
    dispatch(addUserData(domain?.ID || -1, {
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
      // Chat user only available for normal users, if domain has a chat team
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
          status: USER_STATUS.NORMAL,
          loading: false,
          password: '',
          repeatPw: '',
        });
        setUsernameError(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setState({ ...state, loading: false });
      });
  }

  const handleAddAndEdit = () => {
    const { username, password, properties, domain, status, homeserver, chat, lang } = state;
    // eslint-disable-next-line camelcase
    const { smtp, pop3_imap, changePassword,
      privChat, privVideo, privFiles, privArchive } = CreateParams.user;
    const checkboxes = status !== USER_STATUS.SHARED ?
    // eslint-disable-next-line camelcase
      { smtp, pop3_imap, changePassword, privChat, privVideo, privFiles, privArchive }
      : {};
    setState({ ...state, loading: true });
    dispatch(addUserData(domain?.ID || -1, {
      username,
      password: status === USER_STATUS.SHARED ? undefined : password,
      homeserver: homeserver?.ID || null,
      status,
      properties: {
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
      ...checkboxes,
      lang,
      chat,
    }))
      .then(user => {
        navigate('/' + domain?.ID + '/users/' + user.ID);
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

  const handleAutocomplete = async (e, domain) => {
    const { username, chat } = state;
    if(!domain) return;
    const domainDetails = await dispatch(fetchDomainDetails(domain.ID));
    if(username && domain) debounceFetch({ email: encodeURIComponent(username + '@' + domain?.domainname) });
    setState({
      ...state,
      domain,
      chatAvailable: domainDetails.chat || false,
      chat: chat && domainDetails.chat,
    });
  }

  const handleServer = (e, newVal) => {
    setState({
      ...state,
      homeserver: newVal || '',
    });
  }

  const { username, loading, properties, password, repeatPw,
    domain, status, homeserver, lang, chat, chatAvailable } = state;
  const { displayname, displaytypeex } = properties;
  const addDisabled = !domain || usernameError || !username || loading ||
      ((password !== repeatPw || (password.length < 6 && !config.devMode)) && status !== USER_STATUS.SHARED);
    
  return (
    <Dialog
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
          <MagnitudeAutocomplete
            value={domain}
            filterAttribute={'domainname'}
            onChange={handleAutocomplete}
            className={classes.input} 
            options={Domains}
            label={t('Domain')}
            placeholder={t("Search domains")  + "..."}
            autoFocus
            autoSelect
          />
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
            onChange={handleUsernameInput}
            fullWidth
            className={classes.input}
            required
            error={!!username && usernameError}
            slotProps={{
              input: {
                endAdornment: <div>@{domain?.domainname || '<select domain>'}</div>,
                className: classes.noWrap,
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
            autoComplete="off"
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
          <MagnitudeAutocomplete<Server>
            value={homeserver}
            filterAttribute={'hostname'}
            onChange={handleServer}
            className={classes.input} 
            options={Servers}
            label={t('Homeserver')}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
          />
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
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={addDisabled}
          type='submit'
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


export default AddGlobalUser;
