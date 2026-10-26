// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid2,
  TextField,
  FormControl,
  Button,
  Tooltip,
  IconButton,
  FormControlLabel,
  Switch,
  Theme
} from '@mui/material';
import { getStringAfterLastSlash } from '../utils';
import { editOrgData, fetchOrgsDetails } from '../actions/orgs';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { fetchDomainData, fetchDrawerDomains } from '../actions/domains';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';
import { Help } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store';
import { UpdateOrg } from '@/types/orgs';
import { ChangeEvent } from '@/types/common';
import { BaseDomain, Domain } from '@/types/domains';
import OrgLdap from '../components/OrgLdap';


const useStyles = makeStyles()((theme: Theme) => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  base: {
    flexDirection: 'column',
    flex: 1,
    display: 'flex',
  },
  formControl: {
    width: '100%',
  },
  textfield: {
    margin: theme.spacing(2, 2, 2, 2),
  },
  attribute: {
    marginLeft: 8,
  },
  tooltip: {
    marginTop: -2,
  },
  ldapSwitch: {
    marginLeft: 8,
  },
}));


interface OrgState {
  // Org
  ID: number,
  name: string,
  domains: BaseDomain[],
  description: string,
  unsaved: boolean;
  overridingLdap: boolean;

  deleting: boolean;
  taskMessage: string;
  taskID: number;
  force: boolean;
  snackbar: string;
  loading: boolean;
}

const OrgDetails = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const { Domains } = useAppSelector(state => state.domains);
  const [state, setState] = useState<OrgState>({
    // Org
    ID: -1,
    name: '',
    domains: [],
    description: '',
    
    unsaved: false,

    deleting: false,
    taskMessage: '',
    taskID: -1,
    force: false,
    snackbar: '',
    overridingLdap: false,
    loading: true,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const edit = async (org: UpdateOrg) => await dispatch(editOrgData(org));
  const fetch = async (id: number) => await dispatch(fetchOrgsDetails(id));
  const fetchDomains = async () =>
    await dispatch(fetchDomainData({ limit: 1000000, level: 0, sort: 'domainname,asc' }));

  useEffect(() => {
    const inner = async () => {
      const orgID = parseInt(getStringAfterLastSlash());
      fetchDomains()
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      const org = await fetch(orgID)
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      setState({
        ...state,
        ...(org || {}),
        loading: false,
      });
    };

    inner();
  }, []);

  const handleInput = (field: string) => (event: ChangeEvent) => {
    setState({
      ...state, 
      [field]: event.target.value,
      unsaved: true,
    });
  }

  const handleEdit = () => {
    const { ID, name, domains, description } = state;
    edit({
      ID,
      name,
      description,
      domains: domains.map(d => d.ID),
    })
      .then(() => {

        // Refetch drawer domains so the routes have knowledge about org updates
        dispatch(fetchDrawerDomains());

        setState({ ...state, snackbar: 'Success!' });
      })
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const handleNavigation = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleAutocomplete = (field: string) => (_: unknown, newVal: Domain[]) => {
    setState({
      ...state, 
      [field]: newVal,
      unsaved: true,
    });
  }

  const handleOverride = (e: ChangeEvent) => {
    setState({ ...state, overridingLdap: e.target.checked });
  }

  const { ID, name, description, domains, snackbar, overridingLdap, loading } = state;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  const nameAcceptable = name && name.length < 33;

  return (
    <ViewWrapper
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
    >
      <Paper className={classes.paper} elevation={1}>
        <Grid2 container>
          <Typography
            color="primary"
            variant="h5"
          >
            {t('editHeadline', { item: 'Organization' })}
          </Typography>
        </Grid2>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Name")}
            onChange={handleInput('name')}
            fullWidth 
            value={name || ''}
            autoFocus
            required
            error={!nameAcceptable}
          />
          <TextField 
            className={classes.input} 
            label={t("Description")} 
            fullWidth
            onChange={handleInput('description')}
            value={description || ''}
            multiline
            rows={4}
            variant="outlined"
          />
          <MagnitudeAutocomplete
            multiple
            value={domains || []}
            filterAttribute={'domainname'}
            onChange={handleAutocomplete('domains')}
            isOptionEqualToValue={(option, value) => option.ID === value.ID}
            className={classes.input} 
            options={Domains || []}
            label={t('Domains')}
            placeholder={t("Search domains") + "..."}
          />
        </FormControl>
        <Button
          color="secondary"
          onClick={handleNavigation('orgs')}
          style={{ marginRight: 8 }}
        >
          {t('Back')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEdit}
          disabled={!writable || !nameAcceptable}
        >
          {t('Save')}
        </Button>
      </Paper>
      <FormControlLabel
        className={classes.ldapSwitch}
        control={
          <Switch
            checked={overridingLdap}
            value={overridingLdap}
            onChange={handleOverride}
            name="disabled"
            color="primary"
          />
        }
        label={<span>
          {t('Show LDAP config')}
          <Tooltip
            className={classes.tooltip}
            title={t("Specify explicit LDAP configuration for this organisation") + " (" +
              t("This switch will only hide the UI, it will not change any settings") + ")"}
            placement="top"
          >
            <IconButton size="small">
              <Help fontSize="small"/>
            </IconButton>
          </Tooltip>
        </span>}
      />
      {overridingLdap && <OrgLdap orgID={ID}/>}
    </ViewWrapper>
  );
}


export default OrgDetails;
