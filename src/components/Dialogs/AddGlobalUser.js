// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useCallback, useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, FormControlLabel, Checkbox,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
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

const styles = theme => ({
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
});

const AddGlobalUser = props => {
  const [state, setState] = useState({
    username: '',
    properties: {
      displayname: '',
      storagequotalimit: '',
      displaytypeex: USER_TYPE.NORMAL,
    },
    status: USER_STATUS.NORMAL,
    loading: false,
    password: '',
    repeatPw: '',
    domain: '',
    homeserver: '',
    lang: 'en_US',
    chatAvailable: false,
  });
  const [langs, setLangs] = useState([]);
  const config = useSelector((state) => state.config);
  const [usernameError, setUsernameError] = useState(false);
  const navigate = useNavigate();

  const handleEnter = async () => {
    const { fetchDomains, fetchServers, fetchDefaults, storeLangs, onError } = props;
    fetchDomains().catch(error => onError(error));
    fetchServers().catch(error => onError(error));
    fetchDefaults()
      .then(() => {
        const { createParams } = props;
        // Update mask
        setState(getStateOverwrite(createParams));
      })
      .catch(error => onError(error));
    const langs = await storeLangs()
      .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
    if(langs) setLangs(langs);
  }

  const getStateOverwrite = (createParams) => {
    if(!createParams) return state;
    const user = createParams.user;
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
      .catch(snackbar => setState({ ...state, snackbar, loading: false }));
    setUsernameError(!!resp?.email);
  }, 500), []);

  const handleCheckbox = field => event => setState({ ...state, [field]: event.target.checked });

  const handleAdd = e => {
    e.preventDefault();
    const { add, onError, onSuccess, createParams } = props;
    const { username, password, properties, domain, status, homeserver, chat, lang } = state;
    // eslint-disable-next-line camelcase
    const { smtp, pop3_imap, changePassword,
      privChat, privVideo, privFiles, privArchive } = createParams.user;
    const checkboxes = status !== USER_STATUS.SHARED ?
    // eslint-disable-next-line camelcase
      { smtp, pop3_imap, changePassword, privChat, privVideo, privFiles, privArchive }
      : {};
    setState({ ...state, loading: true });
    add(domain?.ID || -1, {
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
    })
      .then(() => {
        setState({
          ...state,
          username: '',
          properties: {
            displayname: '',
            storagequotalimit: '',
            displaytypeex: USER_TYPE.NORMAL,
          },
          status: USER_STATUS.NORMAL,
          loading: false,
          password: '',
          repeatPw: '',
          usernameError: false,
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setState({ ...state, loading: false });
      });
  }

  const handleAddAndEdit = () => {
    const { add, onError, createParams } = props;
    const { username, password, subType, properties, domain, status, homeserver, chat, lang } = state;
    // eslint-disable-next-line camelcase
    const { smtp, pop3_imap, changePassword,
      privChat, privVideo, privFiles, privArchive } = createParams.user;
    const checkboxes = status !== USER_STATUS.SHARED ?
    // eslint-disable-next-line camelcase
      { smtp, pop3_imap, changePassword, privChat, privVideo, privFiles, privArchive }
      : {};
    setState({ ...state, loading: true });
    add(domain?.ID || -1, {
      username,
      password: status === USER_STATUS.SHARED ? undefined : password,
      subType,
      homeserver: homeserver?.ID || null,
      status,
      properties: {
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
      ...checkboxes,
      lang,
      chat,
    })
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
    const domainDetails = await props.fetchDomainDetails(domain.ID);
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

  const { classes, t, open, onClose, Domains, servers } = props;
  const { username, loading, properties, password, repeatPw,
    domain, status, homeserver, lang, chat, chatAvailable } = state;
  const { displayname, displaytypeex } = properties;
  const addDisabled = !domain || usernameError || !username || loading ||
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
            value={displaytypeex || USER_TYPE.NORMAL}
            onChange={handlePropertyChange('displaytypeex')}
          >
            {userTypes.map((type, key) => (
              <MenuItem key={key} value={type.ID}>
                {t(type.name)}
              </MenuItem>
            ))}
          </TextField>
          <MagnitudeAutocomplete
            value={homeserver}
            filterAttribute={'hostname'}
            onChange={handleServer}
            className={classes.input} 
            options={servers}
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
    </Dialog>)
  );
}

AddGlobalUser.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  Domains: PropTypes.array.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  servers: PropTypes.array.isRequired,
  fetchServers: PropTypes.func.isRequired,
  fetchDefaults: PropTypes.func.isRequired,
  fetchDomainDetails: PropTypes.func.isRequired,
  createParams: PropTypes.object.isRequired,
  storeLangs: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Domains: state.domains.Domains,
    servers: state.servers.Servers,
    createParams: state.defaults.CreateParams,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDomains: async () => await dispatch(fetchDomainData({ limit: 1000000, level: 0, sort: 'domainname,asc' }))
      .catch(message => Promise.reject(message)),
    add: async (domainID, user) => 
      await dispatch(addUserData(domainID, user))
        .then(user => Promise.resolve(user))
        .catch(msg => Promise.reject(msg)),
    fetchServers: async () => await dispatch(fetchServersData({ sort: 'hostname,asc', limit: 1000000, level: 0 }))
      .catch(message => Promise.reject(message)),
    fetchDefaults: async () => await dispatch(fetchCreateParamsData())
      .catch(message => Promise.reject(message)),
    fetchDomainDetails: async id => await dispatch(fetchDomainDetails(id))
      .then(domain => domain)
      .catch(msg => Promise.reject(msg)),
    storeLangs: async () => await dispatch(getStoreLangs()).catch(msg => Promise.reject(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(AddGlobalUser, styles)));
