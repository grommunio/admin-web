// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, Select,
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';
import { fetchDomainData } from '../../actions/domains';
import { addUserData } from '../../actions/users';
import { withRouter } from 'react-router';
import { debounce } from 'debounce';
import { checkFormat } from '../../api';
import { Autocomplete } from '@material-ui/lab';
import { getAutocompleteOptions } from '../../utils';

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

class AddGlobalUser extends PureComponent {

  state = {
    username: '',
    properties: {
      displayname: '',
      storagequotalimit: '',
      displaytypeex: 0,
    },
    loading: false,
    password: '',
    repeatPw: '',
    sizeUnits: {
      storagequotalimit: 1,
      prohibitreceivequota: 1,
      prohibitsendquota: 1,
    },
    usernameError: false,
    domain: '',
    autocompleteInput: '',
  }

  types = [
    { name: 'Normal', ID: 0 },
    { name: 'Room', ID: 7 },
    { name: 'Equipment', ID: 8 },
  ]

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleUsernameInput = event => {
    const { domain } = this.state;
    const val = event.target.value;
    if(val && domain) this.debounceFetch({ email: encodeURIComponent(val + '@' + domain?.domainname) });
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
    const { add, onError, onSuccess } = this.props;
    const { username, password, properties, sizeUnits, domain } = this.state;
    this.setState({ loading: true });
    add(domain?.ID || -1, {
      username,
      password,
      properties: {
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
        storagequotalimit: properties.storagequotalimit * Math.pow(2, 10 * sizeUnits.storagequotalimit) || undefined,
        prohibitreceivequota: properties.prohibitreceivequota *
          Math.pow(2, 10 * sizeUnits.prohibitreceivequota) || undefined,
        prohibitsendquota: properties.prohibitsendquota * Math.pow(2, 10 * sizeUnits.prohibitsendquota) || undefined,
      },
    })
      .then(() => {
        this.setState({
          username: '',
          properties: {
            displayname: '',
            storagequotalimit: '',
            displaytypeex: 0,
          },
          sizeUnit: 1,
          loading: false,
          password: '',
          repeatPw: '',
          usernameError: false,
          autocompleteInput: '',
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  handleAddAndEdit = () => {
    const { history, add, onError } = this.props;
    const { username, password, subType, properties, sizeUnits, domain } = this.state;
    this.setState({ loading: true });
    add(domain?.ID || -1, {
      username,
      password,
      subType,
      properties: {
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
        storagequotalimit: properties.storagequotalimit * Math.pow(2, 10 * sizeUnits.storagequotalimit) || undefined,
        prohibitreceivequota: properties.prohibitreceivequota *
          Math.pow(2, 10 * sizeUnits.prohibitreceivequota) || undefined,
        prohibitsendquota: properties.prohibitsendquota * Math.pow(2, 10 * sizeUnits.prohibitsendquota) || undefined,
      },
    })
      .then(user => {
        history.push('/' + domain?.ID + '/users/' + user.ID);
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

  handleUnitChange = unit => event => this.setState({
    sizeUnits: {
      ...this.state.sizeUnits,
      [unit]: event.target.value,
    },
  });

  handleAutocomplete = (e, domain) => {
    const { username } = this.state;
    if(username && domain) this.debounceFetch({ email: encodeURIComponent(username + '@' + domain?.domainname) });
    this.setState({
      domain,
      autocompleteInput: domain?.domainname || '',
    });
  }

  render() {
    const { classes, t, open, onClose, fetchDomains, Domains } = this.props;
    const { username, loading, properties, password, repeatPw, sizeUnits,
      usernameError, domain, autocompleteInput } = this.state;
    const { prohibitreceivequota, prohibitsendquota, storagequotalimit, displayname, displaytypeex } = properties;
    const addDisabled = usernameError || !username || loading || password !== repeatPw || password.length < 6;
    
    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="sm"
        fullWidth
        TransitionProps={{
          onEnter: fetchDomains,
        }}
      >
        <DialogTitle>{t('addHeadline', { item: 'User' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <Autocomplete
              options={Domains || []}
              value={domain}
              inputValue={autocompleteInput}
              filterOptions={getAutocompleteOptions('domainname')}
              noOptionsText={autocompleteInput.length < Math.round(Math.log10(Domains.length) - 2) ?
                t('Filter more precisely') + '...' : t('No options')}
              onChange={this.handleAutocomplete}
              getOptionLabel={(domain) => domain.domainname || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Domain"
                  placeholder="Search domains..."
                  autoFocus
                  onChange={this.handleInput('autocompleteInput')}
                />
              )}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
              autoSelect
            />
            <TextField 
              label={t("Username")}
              value={username || ''}
              onChange={this.handleUsernameInput}
              fullWidth
              InputProps={{
                endAdornment: <div>@{domain?.domainname || '<select domain>'}</div>,
                className: classes.noWrap,
              }}
              className={classes.input}
              required
              error={!!username && usernameError}
            />
            <TextField 
              label={t("Password")}
              value={password || ''}
              onChange={this.handleInput('password')}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
              type="password"
              required
              FormHelperTextProps={{
                error: true,
              }}
              helperText={(password && password.length < 6) ? t('Password must be at least 6 characters long') : ''}
              autoComplete="new-password"
            />
            <TextField 
              label={t("Repeat password")}
              value={repeatPw || ''}
              onChange={this.handleInput('repeatPw')}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
              type="password"
              required
              FormHelperTextProps={{
                error: true,
              }}
              autoComplete="off"
              helperText={(repeatPw && password !== repeatPw) ? t("Passwords don't match") : ''}
            />
            <TextField 
              label={t("Display name")}
              value={displayname || ''}
              onChange={this.handlePropertyChange('displayname')}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
            />
            <TextField 
              className={classes.input} 
              label={t("Send quota limit")}
              value={prohibitsendquota || ''}
              onChange={this.handleIntPropertyChange('prohibitsendquota')}
              InputProps={{
                endAdornment:
                  <FormControl>
                    <Select
                      onChange={this.handleUnitChange('prohibitsendquota')}
                      value={sizeUnits.prohibitsendquota}
                      className={classes.select}
                    >
                      <MenuItem value={1}>MB</MenuItem>
                      <MenuItem value={2}>GB</MenuItem>
                      <MenuItem value={3}>TB</MenuItem>
                    </Select>
                  </FormControl>,
              }}
            />
            <TextField 
              className={classes.input} 
              label={t("Receive quota limit")}
              value={prohibitreceivequota || ''}
              onChange={this.handleIntPropertyChange('prohibitreceivequota')}
              InputProps={{
                endAdornment:
                  <FormControl>
                    <Select
                      onChange={this.handleUnitChange('prohibitreceivequota')}
                      value={sizeUnits.prohibitreceivequota}
                      className={classes.select}
                    >
                      <MenuItem value={1}>MB</MenuItem>
                      <MenuItem value={2}>GB</MenuItem>
                      <MenuItem value={3}>TB</MenuItem>
                    </Select>
                  </FormControl>,
              }}
            />
            <TextField 
              className={classes.input} 
              label={t("Storage quota limit")}
              value={storagequotalimit || ''}
              onChange={this.handleIntPropertyChange('storagequotalimit')}
              InputProps={{
                endAdornment:
                  <FormControl>
                    <Select
                      onChange={this.handleUnitChange('storagequotalimit')}
                      value={sizeUnits.storagequotalimit}
                      className={classes.select}
                    >
                      <MenuItem value={1}>MB</MenuItem>
                      <MenuItem value={2}>GB</MenuItem>
                      <MenuItem value={3}>TB</MenuItem>
                    </Select>
                  </FormControl>,
              }}
            />
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
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            variant="contained"
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

AddGlobalUser.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  Domains: PropTypes.array.isRequired,
  fetchDomains: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Domains: state.domains.Domains,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDomains: async () => dispatch(fetchDomainData({ sort: 'domainname,asc' })),
    add: async (domainID, user) => 
      await dispatch(addUserData(domainID, user))
        .then(user => Promise.resolve(user))
        .catch(msg => Promise.reject(msg)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddGlobalUser))));
