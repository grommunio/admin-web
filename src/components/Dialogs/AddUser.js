// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useCallback, useContext, useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, FormControlLabel, Checkbox,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
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
import { SYSTEM_ADMIN_WRITE } from '../../constants';

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
});

const AddUser = props => {
  const [state, setState] = useState({
    username: '',
    properties: {
      displayname: '',
      storagequotalimit: '',
      displaytypeex: 0,
    },
    status: 0,
    loading: false,
    password: '',
    repeatPw: '',
    homeserver: '',
    lang: 'en_US',
    chatAvailable: false,
  });
  const config = useSelector((state) => state.config);
  const [langs, setLangs] = useState([]);
  const [usernameError, setUsernameError] = useState(false);
  const navigate = useNavigate();
  const context = useContext(CapabilityContext);
  const isSystemAdmin = context.includes(SYSTEM_ADMIN_WRITE);

  const statuses = [
    { name: 'Normal', ID: 0 },
    { name: 'Suspended', ID: 1 },
    { name: 'Shared', ID: 4 },
  ]

  const types = [
    { name: 'Normal', ID: 0 },
    { name: 'Room', ID: 7 },
    { name: 'Equipment', ID: 8 },
  ]

  const handleEnter = async () => {
    const { fetchServers, fetchDefaults, domain, storeLangs, fetchDomainDetails } = props;
    if(isSystemAdmin) fetchServers().catch(error => props.onError(error));
    const domainDetails = await fetchDomainDetails(domain.ID);
    const langs = await storeLangs()
      .catch(msg => setState({ ...state, snackbar: msg || 'Unknown error' }));
    if(langs) setLangs(langs);
    fetchDefaults(null, {domain: domain.ID})
      .then(() => {
        const { createParams } = props;
        // Update mask
        setState({
          ...state,
          chatAvailable: domainDetails.chat || false,
          ...getStateOverwrite(createParams, domainDetails.chat),
        });
      })
      .catch(error => props.onError(error));
  }

  const getStateOverwrite = (createParams, chatAvailable) => {
    if(!createParams) return {};
    const user = createParams.user;
    const { lang, properties } = user || {};
    return {
      properties: {
        ...(properties || {}),
        storagequotalimit: properties?.storagequotalimit,
        prohibitreceivequota: properties?.prohibitreceivequota,
        prohibitsendquota: properties?.prohibitsendquota,
      },
      lang: lang || 'en_US',
      chat: chatAvailable ? (createParams.domain.chat || false) : false,
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
      .catch(snackbar => setState({ ...state, snackbar, loading: false }));
    setUsernameError(!!resp?.email);
  }, 500), []);

  const handleCheckbox = field => event => setState({ ...state, [field]: event.target.checked });

  const handleAdd = () => {
    const { domain, add, onError, onSuccess, createParams } = props;
    const { username, password, properties, status, homeserver, chat, lang } = state;
    // eslint-disable-next-line camelcase
    const { smtp, pop3_imap, changePassword,
      privChat, privVideo, privFiles, privArchive } = createParams.user;
    const checkboxes = status !== 4 ?
    // eslint-disable-next-line camelcase
      { smtp, pop3_imap, changePassword, privChat, privVideo, privFiles, privArchive }
      : {};
    setState({ ...state, loading: true });
    add(domain.ID, {
      username,
      password: status === 4 ? undefined : password,
      status,
      homeserver: homeserver?.ID || null,
      properties: {
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
      ...checkboxes,
      lang,
      chat,
    })
      .then(() => {
        setState({
          ...state,
          username: '',
          properties: {
            displayname: '',
            displaytypeex: 0,
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
    const { domain, add, onError, createParams } = props;
    const { username, password, subType, properties, status, homeserver, chat, lang } = state;
    // eslint-disable-next-line camelcase
    const { smtp, pop3_imap, changePassword,
      privChat, privVideo, privFiles, privArchive } = createParams.user;
    const checkboxes = status !== 4 ?
    // eslint-disable-next-line camelcase
      { smtp, pop3_imap, changePassword, privChat, privVideo, privFiles, privArchive }
      : {};
    setState({ ...state, loading: true });
    add(domain.ID, {
      username,
      password: status === 4 ? undefined : password,
      status,
      subType,
      homeserver: homeserver?.ID || null,
      properties: {
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      },
      ...checkboxes,
      lang,
      chat,
    })
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

  const { classes, t, domain, open, onClose, servers } = props;
  const { username, loading, properties, password, repeatPw,
    status, homeserver, lang, chat, chatAvailable } = state;
  const { displayname, displaytypeex } = properties;
  const addDisabled = usernameError || !username || loading || 
      ((password !== repeatPw || (password.length < 6 && !config.devMode)) && status !== 4);
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
            value={status || 0}
            onChange={handleInput('status')}
          >
            {statuses.map((status, key) => (
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
          {status !== 4 && <TextField 
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
          {status !== 4 && <TextField 
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
            value={displaytypeex || 0}
            onChange={handlePropertyChange('displaytypeex')}
          >
            {types.map((type, key) => (
              <MenuItem key={key} value={type.ID}>
                {t(type.name)}
              </MenuItem>
            ))}
          </TextField>
          {isSystemAdmin && <MagnitudeAutocomplete
            value={homeserver}
            filterAttribute={'hostname'}
            onChange={handleAutocomplete('homeserver')}
            className={classes.input} 
            options={servers}
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

AddUser.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  servers: PropTypes.array.isRequired,
  fetchServers: PropTypes.func.isRequired,
  fetchDefaults: PropTypes.func.isRequired,
  fetchDomainDetails: PropTypes.func.isRequired,
  createParams: PropTypes.object.isRequired,
  storeLangs: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    servers: state.servers.Servers,
    createParams: state.defaults.CreateParams,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, user) => 
      await dispatch(addUserData(domainID, user))
        .then(user => Promise.resolve(user))
        .catch(msg => Promise.reject(msg)),
    fetchServers: async () => await dispatch(fetchServersData({ sort: 'hostname,asc', limit: 1000000, level: 0 }))
      .catch(message => Promise.reject(message)),
    fetchDefaults: async (domainId, params) => await dispatch(fetchCreateParamsData(domainId, params))
      .catch(message => Promise.reject(message)),
    storeLangs: async () => await dispatch(getStoreLangs()).catch(msg => Promise.reject(msg)),
    fetchDomainDetails: async id => await dispatch(fetchDomainDetails(id))
      .then(domain => domain)
      .catch(msg => Promise.reject(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(AddUser, styles)));
