// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions,
  CircularProgress, FormControlLabel, Checkbox,
  Theme,
} from '@mui/material';
import { addDomainData } from '../../actions/domains';
import { fetchOrgsData } from '../../actions/orgs';
import { useTranslation } from 'react-i18next';
import { checkFormat } from '../../api';
import { fetchServersData } from '../../actions/servers';
import { fetchCreateParamsData } from '../../actions/defaults';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { throttle } from 'lodash';
import { domainStatuses } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store';
import { DOMAIN_STATUS, NewDomain } from '../../types/domains';
import { Server } from '@/types/servers';
import { Org } from '@/types/orgs';
import { ChangeEvent } from '@/types/common';


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


type AddDomainProps = {
  open: boolean;
  onClose: () => void;
  onError: (error: string) => void;
  onSuccess: () => void;
}

const AddDomain = (props: AddDomainProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [domain, setDomain] = useState({
    domainname: '',
    domainStatus: 0,
    maxUser: '',
    title: '',
    address: '',
    adminName: '',
    tel: '',
    chat: false,
  });
  const [homeserver, setHomeserver] = useState<Server | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [createRole, setCreateRole] = useState(false);

  const { Orgs: orgs } = useAppSelector(state => state.orgs);
  const { Servers: servers } = useAppSelector(state => state.servers);
  const { CreateParams } = useAppSelector(state => state.defaults);

  const { open, onClose } = props;
  const { domainname, domainStatus, chat,
    maxUser, title, address, adminName, tel } = domain;
  const [loading, setLoading] = useState(false);
  const [domainError, setDomainError] = useState(false);

  const handleEnter = () => {
    const { onError } = props;
    dispatch(fetchOrgsData({ sort: 'name,asc', limit: 1000000, level: 0 }))
      .catch(error => onError(error));
    dispatch(fetchServersData({ sort: 'hostname,asc', limit: 1000000, level: 0 }))
      .catch(error => onError(error));
    dispatch(fetchCreateParamsData())
      .catch(error => onError(error));
  }

  useEffect(() => {
    // Update mask
    setDomain({
      ...domain,
      ...(CreateParams.domain || {}),
    });
  }, [CreateParams]);

  const handleInput = (field: keyof NewDomain) => (event: ChangeEvent) => {
    const val = event.target.value;
    if(val && field === 'domainname') debounceFetch({ domain: val });
    setDomain({
      ...domain,
      [field]: val,
    });
  }

  const debounceFetch = useCallback(throttle(async (params: { domain: string }) => {
    const resp = await checkFormat(params)
      .catch(() => setLoading(false));
    setDomainError(!!resp?.domain);
  }, 200), []);

  const handleCheckbox = (field: keyof NewDomain) => (event: ChangeEvent) => {
    setDomain({
      ...domain,
      [field]: event.target.checked,
    });
  }

  const handleNumberInput = (event: ChangeEvent) => {
    const input: string = event.target.value;
    if(input === "") {
      setDomain({
        ...domain,
        maxUser: "",
      });
    }
    if(input && input.match("^\\d*?$")) {
      setDomain({
        ...domain,
        maxUser: input,
      });
    }
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const { onError, onSuccess } = props;
    setLoading(true);
    dispatch(addDomainData({
      domainStatus: domain.domainStatus,
      maxUser: parseInt(domain.maxUser),
      title: domain.title,
      address: domain.address,
      adminName: domain.adminName,
      tel: domain.tel,
      chat: domain.chat,
      domainname: domainname.trim(),
      orgID: org?.ID || 0,
      homeserver: homeserver?.ID || null,
    }, { createRole }))
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
          chat: false,
        });
        setCreateRole(false);
        setHomeserver(null);
        setOrg(null);
        onSuccess();
        setLoading(false);
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleOrg = (_: unknown, newVal: Org) => {
    setOrg(newVal || '');
  } 

  const handleHomeserver = (_: unknown, newVal: Server) => {
    setHomeserver(newVal || '');
  }

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
      slotProps={{
        transition: {
          onEnter: handleEnter
        }
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
            value={domainStatus || DOMAIN_STATUS.ACTIVATED}
            onChange={handleInput('domainStatus')}
          >
            {domainStatuses.map((status, key) => (
              <MenuItem key={key} value={status.ID}>
                {t(status.name)}
              </MenuItem>
            ))}
          </TextField>
          <MagnitudeAutocomplete<Org>
            value={org}
            filterAttribute={'name'}
            onChange={handleOrg}
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
            onChange={handleNumberInput}
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
          <MagnitudeAutocomplete<Server>
            value={homeserver}
            filterAttribute={'hostname'}
            onChange={handleHomeserver}
            className={classes.input} 
            options={servers}
            label={t('Homeserver')}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={createRole}
                onChange={(e: ChangeEvent) => setCreateRole(e.target.checked)}
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


export default AddDomain;
