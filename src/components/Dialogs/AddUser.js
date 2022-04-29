// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, Autocomplete,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';
import { addUserData, getStoreLangs } from '../../actions/users';
import { withRouter } from 'react-router';
import { debounce } from 'debounce';
import { checkFormat } from '../../api';
import { fetchServersData } from '../../actions/servers';
import { fetchCreateParamsData } from '../../actions/defaults';

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

class AddUser extends PureComponent {

  state = {
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
    lang: '',
    langs: [],
    usernameError: false,
  }

  statuses = [
    { name: 'Normal', ID: 0 },
    { name: 'Shared', ID: 4 },
  ]

  types = [
    { name: 'Normal', ID: 0 },
    { name: 'Room', ID: 7 },
    { name: 'Equipment', ID: 8 },
  ]

  handleEnter = async () => {
    const { fetchServers, fetchDefaults, domain, storeLangs } = this.props;
    fetchServers().catch(error => this.props.onError(error));
    fetchDefaults(null, {domainID: domain.ID})
      .then(() => {
        const { createParams } = this.props;
        // Update mask
        this.setState(this.getStateOverwrite(createParams));
      })
      .catch(error => this.props.onError(error));
    const langs = await storeLangs()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
    if(langs) this.setState({ langs });
  }

  getStateOverwrite(createParams) {
    if(!createParams) return {};
    const user = createParams.user;
    return {
      properties: {
        ...this.state.properties,
        storagequotalimit: user.storagequotalimit,
        prohibitreceivequota: user.prohibitreceivequota,
        prohibitsendquota: user.prohibitsendquota,
      },
      lang: user.lang,
    };
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleUsernameInput = event => {
    const { domain } = this.props;
    const val = event.target.value;
    if(val) this.debounceFetch({ email: encodeURIComponent(val + '@' + domain.domainname) });
    this.setState({
      username: val,
    });
  }

  debounceFetch = debounce(async params => {
    const resp = await checkFormat(params)
      .catch(snackbar => this.setState({ snackbar, loading: false }));
    this.setState({ usernameError: !!resp?.email });
  }, 200)

  handleCheckbox = field => event => this.setState({ [field]: event.target.checked });

  handleChatUser = e => {
    const { checked } = e.target;
    this.setState({
      chat: checked,
      chatAdmin: false,
    });
  }

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      [field]: input,
    });
  }

  handleAdd = () => {
    const { domain, add, onError, onSuccess, createParams } = this.props;
    const { username, password, properties, status, homeserver } = this.state;
    // eslint-disable-next-line camelcase
    const { smtp, pop3_imap, changePassword, lang, privChat, privVideo, privFiles, privArchive } = createParams.user;
    const checkboxes = status !== 4 ?
    // eslint-disable-next-line camelcase
      { smtp, pop3_imap, changePassword, privChat, privVideo, privFiles, privArchive }
      : {};
    this.setState({ loading: true });
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
    })
      .then(() => {
        this.setState({
          username: '',
          properties: {
            displayname: '',
            displaytypeex: 0,
          },
          loading: false,
          password: '',
          repeatPw: '',
          usernameError: false,
          homeserver: '',
          lang: '',
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handleAddAndEdit = () => {
    const { domain, history, add, onError, createParams } = this.props;
    const { username, password, subType, properties, status, homeserver } = this.state;
    // eslint-disable-next-line camelcase
    const { smtp, pop3_imap, changePassword, lang, privChat, privVideo, privFiles, privArchive } = createParams.user;
    const checkboxes = status !== 4 ?
    // eslint-disable-next-line camelcase
      { smtp, pop3_imap, changePassword, privChat, privVideo, privFiles, privArchive }
      : {};
    this.setState({ loading: true });
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
    })
      .then(user => {
        history.push('/' + domain.ID + '/users/' + user.ID);
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handlePropertyChange = field => event => {
    this.setState({
      properties: {
        ...this.state.properties,
        [field]: event.target.value,
      },
    });
  }

  handleIntPropertyChange = field => event => {
    this.setState({
      properties: {
        ...this.state.properties,
        [field]: parseInt(event.target.value) || '',
      },
    });
  }

  handleAutocomplete = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal || '',
      autocompleteInput: newVal?.name || '',
    });
  }

  render() {
    const { classes, t, domain, open, onClose, servers } = this.props;
    const { username, loading, properties, password, repeatPw, usernameError,
      status, homeserver, lang, langs } = this.state;
    const { displayname, displaytypeex } = properties;
    const addDisabled = usernameError || !username || loading || 
      ((password !== repeatPw || password.length < 6) && status !== 4);
    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
        TransitionProps={{
          onEnter: this.handleEnter,
        }}
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
              onChange={this.handleInput('status')}
            >
              {this.statuses.map((status, key) => (
                <MenuItem key={key} value={status.ID}>
                  {status.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField 
              label={t("Username")}
              value={username || ''}
              autoFocus
              onChange={this.handleUsernameInput}
              InputProps={{
                endAdornment: <div>@{domain.domainname}</div>,
              }}
              className={classes.input}
              required
              error={!!username && usernameError}
            />
            {status !== 4 && <TextField 
              label={t("Password")}
              value={password || ''}
              onChange={this.handleInput('password')}
              className={classes.input}
              type="password"
              required
              FormHelperTextProps={{
                error: true,
              }}
              helperText={(password && password.length < 6) ? t('Password must be at least 6 characters long') : ''}
              autoComplete="new-password"
            />}
            {status !== 4 && <TextField 
              label={t("Repeat password")}
              value={repeatPw || ''}
              onChange={this.handleInput('repeatPw')}
              className={classes.input}
              type="password"
              required
              FormHelperTextProps={{
                error: true,
              }}
              helperText={(repeatPw && password !== repeatPw) ? t("Passwords don't match") : ''}
            />}
            <TextField 
              label={t("Display name")}
              value={displayname || ''}
              onChange={this.handlePropertyChange('displayname')}
              className={classes.input}
            />
            <TextField
              select
              className={classes.input}
              label={t("Language")}
              fullWidth
              value={lang || 'en_US'}
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
              onChange={this.handlePropertyChange('displaytypeex')}
            >
              {this.types.map((type, key) => (
                <MenuItem key={key} value={type.ID}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              value={homeserver}
              noOptionsText={t('No options')}
              getOptionLabel={s => s.hostname || ''}
              renderOption={(props, option) => (
                <li {...props} key={option.ID}>
                  {option.hostname || ''}
                </li>
              )}
              onChange={this.handleAutocomplete('homeserver')}
              className={classes.input} 
              options={servers}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Homeserver")}
                />
              )}
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
            onClick={this.handleAddAndEdit}
            variant="contained"
            color="primary"
            disabled={addDisabled}
          >
            {loading ? <CircularProgress size={24}/> : t('Add and edit')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={addDisabled}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddUser.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  servers: PropTypes.array.isRequired,
  fetchServers: PropTypes.func.isRequired,
  fetchDefaults: PropTypes.func.isRequired,
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
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddUser))));
