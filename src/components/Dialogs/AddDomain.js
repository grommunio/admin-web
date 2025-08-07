// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useCallback, useEffect, useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions,
  CircularProgress, FormControlLabel, Checkbox,
} from '@mui/material';
import { addDomainData } from '../../actions/domains';
import { fetchOrgsData } from '../../actions/orgs';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { checkFormat } from '../../api';
import { fetchServersData } from '../../actions/servers';
import { fetchCreateParamsData } from '../../actions/defaults';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { throttle } from 'lodash';
import { domainStatuses } from '../../constants';

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

const AddDomain = props => {
  const [domain, setDomain] = useState({
    domainname: '',
    domainStatus: 0,
    maxUser: '',
    title: '',
    address: '',
    adminName: '',
    tel: '',
    orgID: '',
    homeserver: '',
    createRole: false,
    chat: false,
  });
  const [loading, setLoading] = useState(false);
  const [domainError, setDomainError] = useState(false);

  const handleEnter = () => {
    const { fetch, fetchServers, fetchDefaults, onError } = props;
    fetch().catch(error => onError(error));
    fetchServers().catch(error => onError(error));
    fetchDefaults()
      .catch(error => onError(error));
  }

  useEffect(() => {
    const { createParams } = props;
    // Update mask
    setDomain({
      ...domain,
      ...(createParams.domain || {}),
    });
  }, [props.createParams]);

  const handleInput = field => event => {
    const val = event.target.value;
    if(val && field === 'domainname') debounceFetch({ domain: val });
    setDomain({
      ...domain,
      [field]: val,
    });
  }

  const debounceFetch = useCallback(throttle(async params => {
    const resp = await checkFormat(params)
      .catch(() => setLoading(false));
    setDomainError(!!resp?.domain);
  }, 200), []);

  const handleCheckbox = field => event => {
    setDomain({
      ...domain,
      [field]: event.target.checked,
    });
  }

  const handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    setDomain({
      ...domain,
      [field]: input,
    });
  }

  const handleAdd = e => {
    e.preventDefault();
    const { add, onError, onSuccess } = props;
    setLoading(true);
    add({
      ...domain,
      domainname: domainname.trim(),
      orgID: orgID.ID,
      homeserver: homeserver?.ID || null,
      createRole: undefined,
    }, { createRole })
      .then(() => {
        setDomain({
          ...domain,
          domainname: '',
          domainStatus: 0,
          maxUser: '',
          title: '',
          address: '',
          adminName: '',
          tel: '',
          createRole: false,
          chat: false,
          homeserver: '',
        });
        onSuccess();
        setLoading(false);
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAutocomplete = (field) => (e, newVal) => {
    setDomain({
      ...domain,
      [field]: newVal || '',
    });
  }

  const { classes, t, open, onClose, orgs, servers } = props;
  const { domainname, domainStatus, orgID, chat, homeserver,
    maxUser, title, address, adminName, tel, createRole } = domain;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
      TransitionProps={{
        onEnter: handleEnter,
      }}>
      <DialogTitle>{t('addHeadline', { item: 'Domain' })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Domain")} 
            fullWidth 
            value={domainname || ''}
            onChange={handleInput('domainname')}
            autoFocus
            required
            error={!!domainname && domainError}
          />
          <TextField
            select
            className={classes.input}
            label={t("Status")}
            fullWidth
            value={domainStatus || 0}
            onChange={handleInput('domainStatus')}
          >
            {domainStatuses.map((status, key) => (
              <MenuItem key={key} value={status.ID}>
                {t(status.name)}
              </MenuItem>
            ))}
          </TextField>
          <MagnitudeAutocomplete
            value={orgID || ""}
            filterAttribute={'name'}
            onChange={handleAutocomplete('orgID')}
            className={classes.input} 
            options={orgs}
            label={t('Organization')}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
          />
          <TextField 
            className={classes.input} 
            label={t("Maximum users")} 
            fullWidth 
            value={maxUser || ''}
            onChange={handleNumberInput('maxUser')}
            required
          />
          <TextField 
            className={classes.input} 
            label={t("Title")} 
            fullWidth 
            value={title || ''}
            onChange={handleInput('title')}
          />
          <TextField 
            className={classes.input} 
            label={t("Address")} 
            fullWidth 
            value={address || ''}
            onChange={handleInput('address')}
          />
          <TextField 
            className={classes.input} 
            label={t("Administrator")} 
            fullWidth 
            value={adminName || ''}
            onChange={handleInput('adminName')}
          />
          <TextField 
            className={classes.input} 
            label={t("Telephone")} 
            fullWidth 
            value={tel || ''}
            onChange={handleInput('tel')}
          />
          <MagnitudeAutocomplete
            value={homeserver}
            filterAttribute={'hostname'}
            onChange={handleAutocomplete('homeserver')}
            className={classes.input} 
            options={servers}
            label={t('Homeserver')}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={createRole}
                onChange={handleCheckbox('createRole')}
                color="primary"
              />
            }
            label={t('Create domain admin role')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={chat}
                onChange={handleCheckbox('chat')}
                color="primary"
              />
            }
            label={t('Create grommunio-chat Team')}
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
          type='submit'
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={loading || !domainname || !maxUser || domainError}
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddDomain.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchServers: PropTypes.func.isRequired,
  fetchDefaults: PropTypes.func.isRequired,
  orgs: PropTypes.array.isRequired,
  servers: PropTypes.array.isRequired,
  createParams: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    orgs: state.orgs.Orgs,
    servers: state.servers.Servers,
    createParams: state.defaults.CreateParams,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domain, params) => {
      await dispatch(addDomainData(domain, params)).catch(message => Promise.reject(message));
    },
    fetch: async () => await dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }))
      .catch(message => Promise.reject(message)),
    fetchServers: async () => await dispatch(fetchServersData({ sort: 'hostname,asc', limit: 1000000, level: 0 }))
      .catch(message => Promise.reject(message)),
    fetchDefaults: async () => await dispatch(fetchCreateParamsData())
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(AddDomain, styles)));
