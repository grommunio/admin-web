// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { withTranslation } from 'react-i18next';
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
  Checkbox,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { connect } from 'react-redux';
import { arrayToObject, getStringAfterLastSlash, objectToArray } from '../utils';
import { editOrgData, fetchOrgsDetails } from '../actions/orgs';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { fetchDomainData } from '../actions/domains';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';
import { Add, Delete, Help } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import LdapTextfield from '../components/LdapTextfield';
import DeleteConfig from '../components/Dialogs/DeleteConfig';
import TaskCreated from '../components/Dialogs/TaskCreated';
import { deleteOrgLdapConfig, fetchOrgLdapConfig, syncOrgLdapUsers, updateOrgLdapConfig } from '../actions/ldap';
import { useNavigate } from 'react-router';

const styles = theme => ({
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
  pageTitle: {
    margin: theme.spacing(2, 2, 1, 2),
  },
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    flex: 1,
    display: 'flex',
  },
  subtitle: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  formControl: {
    width: '100%',
  },
  category: {
    margin: theme.spacing(2, 0, 1, 2),
  },
  textfield: {
    margin: theme.spacing(2, 2, 2, 2),
  },
  flexContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    marginRight: 16,
  },
  flexRow: {
    margin: theme.spacing(0, 1, 0, 1),
    flexWrap: 'wrap',
    display: 'flex',
  },
  deleteButton: {
    marginRight: 8,
    backgroundColor: red['500'],
    '&:hover': {
      backgroundColor: red['700'],
    },
  },
  bottomRow: {
    display: 'flex',
    padding: theme.spacing(2, 2, 4, 2),
  },
  spacer: {
    paddingTop: 16,
  },
  addButton: {
    padding: theme.spacing(1, 0, 0, 0),
  },
  removeButton: {
    margin: theme.spacing(1, 2, 0, 0),
  },
  attribute: {
    marginLeft: 8,
  },
  tooltip: {
    marginTop: -2,
  },
  radioGroup: {
    marginLeft: 16,
  },
  ldapPaper: {
    margin: theme.spacing(3, 2, 1, 2),
    paddingBottom: 16,
  },
  ldapSwitch: {
    marginLeft: 8,
  },
});

const OrgDetails = props => {
  const [state, setState] = useState({
    // Org
    ID: -1,
    name: '',
    domains: [],
    description: '',
    
    unsaved: false,
    baseDn: '',
    objectID: '',
    disabled: true,
    //Connection
    server: '',
    bindUser: '',
    bindPass: '',
    starttls: false,
    // Groups
    groupMemberAttr: '',
    groupaddr: '',
    groupfilter: '',
    groupname: '',
    // Users
    username: '',
    displayName: '',
    defaultQuota: '',
    filter: '',
    contactFilter: '',
    templates: 'none',
    attributes: [],
    searchAttributes: [],
    authBackendSelection: 'externid',
    aliases: '',

    deleting: false,
    taskMessage: '',
    taskID: null,
    force: false,
    snackbar: '',
    overridingLdap: false,
    loading: true,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  useEffect(() => {
    const inner = async () => {
      const { fetch, fetchLdap, fetchDomains } = props;
      const orgID = getStringAfterLastSlash();
      fetchDomains();
      const org = await fetch(orgID)
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  
      // Fetch and format organisation LDAP config
      const ldap = await fetchLdap(orgID)
        .catch(snackbar => setState({ ...state, snackbar }));
      const config = ldap?.data;
      const available = ldap?.ldapAvailable || false;
      const connection = config?.connection || {};
      const groups = config?.groups || {};
      const users = config?.users || {};
      setState({
        ...state,
        ...(org || {}),
        loading: false,
        available,
        baseDn: config.baseDn || '',
        disabled: config.disabled === undefined ? true : config.disabled,
        objectID: config.objectID || '',
        server: connection.server || '',
        bindUser: connection.bindUser || '',
        bindPass: connection.bindPass || '',
        starttls: connection.starttls || false,
        groupMemberAttr: groups.groupMemberAttr || '',
        groupaddr: groups.groupaddr || '',
        groupfilter: groups.groupfilter || '',
        groupname: groups.groupname || '',
        username: users.username || '',
        displayName: users.displayName || '',
        defaultQuota: users.defaultQuota || '',
        filter: users.filter || '',
        contactFilter: users.contactFilter || '',
        templates: users.templates && users.templates.length > 0 ? users.templates[1] : 'none',
        searchAttributes: users.searchAttributes || [],
        attributes: objectToArray(users.attributes || {}),
        aliases: users.aliases || '',
      });
    };

    inner();
  }, []);

  const handleInput = field => event => {
    setState({
      ...state, 
      [field]: event.target.value,
      unsaved: true,
    });
  }

  const handleEdit = () => {
    const { edit } = props;
    const { ID, name, domains, description } = state;
    edit({
      ID,
      name,
      description,
      domains: domains.map(d => d.ID),
    })
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const handleNavigation = path => event => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleAutocomplete = (field) => (e, newVal) => {
    setState({
      ...state, 
      [field]: newVal,
      unsaved: true,
    });
  }

  /* LDAP stuff */

  /* Formats state to new config object for backend */
  const formatData = () => {
    // Create a deep copy of the object
    const copy = structuredClone(state);
    // New, in the end formatted, object
    const formatted = {};
    // Defaults
    formatted.baseDn = copy.baseDn;
    formatted.objectID  = copy.objectID;
    formatted.disabled = copy.disabled;
    // Format connection
    formatted.connection = {};
    formatted.connection.server = copy.server;
    formatted.connection.bindUser = copy.bindUser;
    formatted.connection.bindPass = copy.bindPass;
    formatted.connection.starttls = copy.starttls;

    // Format groups
    formatted.groups = {};
    formatted.groups.groupMemberAttr = copy.groupMemberAttr;
    formatted.groups.groupaddr = copy.groupaddr;
    formatted.groups.groupfilter = copy.groupfilter;
    formatted.groups.groupname = copy.groupname;

    //Format users
    formatted.users = {};
    formatted.users.username = copy.username;
    formatted.users.displayName = copy.displayName;
    formatted.users.attributes = arrayToObject([...state.attributes]);
    formatted.users.defaultQuota = parseInt(copy.defaultQuota) || undefined;
    formatted.users.filter = copy.filter; // Put single string in array (necessary)
    formatted.users.contactFilter = copy.contactFilter;
    formatted.users.templates = copy.templates === 'none' ?
      [] : ['common', copy.templates]; // ['common', 'ActiveDirectory']
    formatted.users.searchAttributes = [...state.searchAttributes];
    formatted.users.aliases = copy.aliases;

    return formatted;
  }

  const handleAttributeInput = (objectPart, idx) => ({ target: t }) => {
    const copy = [...state.attributes];
    copy[idx][objectPart] = t.value;
    setState({
      ...state, 
      attributes: copy,
    });
  }

  const handleNewRow = () => {
    const copy = [...state.attributes];
    copy.push({ key: '', value: '' });
    setState({
      ...state, 
      attributes: copy,
    });
  }

  const removeRow = idx => () => {
    const copy = [...state.attributes];
    copy.splice(idx, 1);
    setState({ ...state, attributes: copy });
  }

  const handleDelete = () => setState({ ...state, deleting: true });

  const handleDeleteSuccess = () => {
    setState({
      ...state, 
      baseDn: '',
      objectID: '',
      disabled: true,
      // Connection
      server: '',
      bindUser: '',
      bindPass: '',
      starttls: false,
      // Groups
      groupMemberAttr: '',
      groupaddr: '',
      groupfilter: '',
      groupname: '',
      // Users
      username: '',
      displayName: '',
      defaultQuota: '',
      filter: '',
      contactFilter: '',
      templates: 'none',
      attributes: [],
      searchAttributes: [],
      authBackendSelection: 'externid',
      aliases: '',
      deleting: false,
      snackbar: 'Success!'
    });
  }

  const handleDeleteClose = () => setState({ ...state, deleting: false });

  const handleDeleteError = error => setState({ ...state, snackbar: error });

  const handleSync = importUser => () => props.sync(getStringAfterLastSlash(), { import: importUser })
    .then(response => {
      if(response?.taskID) {
        setState({
          ...state, 
          taskMessage: response.message || 'Task created',
          loading: false,
          taskID: response.taskID,
        });
      } else {
        setState({ ...state, snackbar: 'Success! ' + (response?.message || '') });
      }
    })
    .catch(snackbar => setState({ ...state, snackbar }));

  const handleTaskClose = () => setState({
    ...state, 
    taskMessage: "",
    taskID: null,
  })

  const handleCheckbox = field => () => setState({
    ...state, 
    [field]: !state[field],
  });

  const handleOverride = e => {
    setState({ ...state, overridingLdap: e.target.checked });
  }

  const handleTemplate = ({ target: t }) => {
    const templates = t.value;
    if(templates === 'ActiveDirectory') {
      setState({
        ...state, 
        templates,
        objectID: 'objectGUID',
        username: 'mail',
        displayName: 'displayName',
        searchAttributes: ["mail", "givenName", "cn", "sn", "name", "displayName"],
        filter: "objectClass=user",
        contactFilter: "objectclass=contact",
        aliases: 'proxyAddresses',
        groupMemberAttr: "memberOf",
        groupaddr: "mail",
        groupfilter: "(objectclass=group)",
        groupname: "cn",
      });
    } else if(templates === 'OpenLDAP') {
      setState({
        ...state, 
        templates,
        objectID: 'entryUUID',
        username: 'mail',
        displayName: 'displayName',
        searchAttributes: ["mail", "givenName", "cn", "sn", "displayName", "gecos"],
        filter: "objectClass=posixAccount",
        contactFilter: '(&(|(objectclass=person)(objectclass=inetOrgPerson))(!(objectclass=posixAccount))(!(objectclass=shadowAccount)))',
        aliases: 'mailAlternativeAddress',
        groupMemberAttr: "memberOf",
        groupaddr: "mailPrimaryAddress",
        groupfilter: "(objectclass=posixgroup)",
        groupname: "cn",
      });
    } else if(templates === 'Univention') {
      setState({
        ...state, 
        templates,
        objectID: 'entryUUID',
        username: 'mailPrimaryAddress',
        displayName: 'displayName',
        searchAttributes: ["mail", "givenName", "cn", "sn", "displayName", "gecos"],
        filter: "objectClass=posixAccount",
        contactFilter: '(&(|(objectclass=person)(objectclass=inetOrgPerson))(!(objectclass=posixAccount))(!(objectclass=shadowAccount)))',
        aliases: 'mailAlternativeAddress',
        groupMemberAttr: "memberOf",
        groupaddr: "mailPrimaryAddress",
        groupfilter: "(objectclass=posixgroup)",
        groupname: "cn",
      });
    } else if(templates === '389ds') {
      setState({
        ...state, 
        templates,
        objectID: 'entryUUID',
        username: 'mail',
        displayName: 'displayName',
        searchAttributes: ["mail", "givenName", "cn", "sn", "displayName"],
        filter: "objectClass=posixAccount",
        contactFilter: '(&(|(objectclass=person)(objectclass=inetOrgPerson))(!(objectclass=posixAccount)))',
        aliases: 'mailAlternateAddress',
        groupMemberAttr: "memberOf",
        groupaddr: "mail",
        groupfilter: "(objectclass=posixGroup)",
        groupname: "cn",
      });
    } else {
      setState({ ...state, templates });
    }
  }

  const handleSaveLdap = e => {
    const { put } = props;
    const { force } = state;
    e.preventDefault();
    put(getStringAfterLastSlash(), formatData(), { force: force })
      .then(resp => setState({ ...state, snackbar: 'Success! ' + (resp?.message || '') }))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const { classes, t, Domains, adminConfig } = props;
  const { ID, name, description, domains, snackbar, available, force, deleting, server, bindUser,
    bindPass, starttls, baseDn, objectID, disabled, groupMemberAttr, groupaddr, groupfilter, groupname,
    username, filter, contactFilter, templates, attributes, defaultQuota, displayName, searchAttributes,
    aliases, taskMessage, taskID, overridingLdap, loading } = state;
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
      {overridingLdap && <form className={classes.base} onSubmit={handleSaveLdap}>
        <Typography variant="h2" className={classes.pageTitle}>
          {t("LDAP Directory")}
          <Tooltip
            className={classes.tooltip}
            title={t("ldap_settingsHelp")}
            placement="top"
          >
            <IconButton
              size="small"
              href="https://docs.grommunio.com/admin/administration.html#ldap"
              target="_blank"
            >
              <Help fontSize="small"/>
            </IconButton>
          </Tooltip>
        </Typography>
        <Typography variant="caption" className={classes.subtitle}>
          {t('ldap_sub')}
        </Typography>
        <Grid2 container className={classes.category}>
          <FormControlLabel
            control={
              <Switch
                checked={!disabled}
                value={!disabled}
                onChange={handleCheckbox("disabled")}
                name="disabled"
                color="primary"
              />
            }
            label={<span>
              {t('LDAP enabled')}
              <Tooltip
                className={classes.tooltip}
                title={t("Enable LDAP service")}
                placement="top"
              >
                <IconButton size="small">
                  <Help fontSize="small"/>
                </IconButton>
              </Tooltip>
            </span>}
          />
          <div className={classes.flexContainer}>
            <Tooltip placement="top" title={t("Synchronize already imported users")}>
              <Button
                variant="contained"
                color="primary"
                style={{ marginRight: 16 }}
                onClick={handleSync(false)}
              >
                {t("Sync users")}
              </Button>
            </Tooltip>
            <Tooltip
              placement="top"
              title={t("ldap_import_tooltip")}
            >
              <Button
                variant="contained"
                color="primary"
                style={{ marginRight: 16 }}
                onClick={handleSync(true)}
              >
                {t("Import users")}
              </Button>
            </Tooltip>
          </div>
        </Grid2>
        <Typography
          color="inherit"
          variant="caption"
          style={{
            marginLeft: 16,
            color: available ? green['500'] : red['500'],
          }}
        >
          {!disabled && (available ? t('LDAP connectivity check passed') : t('LDAP connectivity check failed'))}
        </Typography>
        <Paper elevation={1} className={classes.ldapPaper}>
          <Typography variant="h6" className={classes.category}>{t('LDAP Server')}</Typography>
          <FormControl className={classes.formControl}>
            <div className={classes.flexRow}>
              <LdapTextfield
                flex
                label={t('LDAP Server')}
                autoFocus
                placeholder="ldap://[::1]:389/"
                onChange={handleInput('server')}
                value={server || ''}
                desc={t("ldap_server_desc")}
                id="url"
                name="url"
                autoComplete="url"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <LdapTextfield
                flex
                label={t("LDAP Bind DN")}
                onChange={handleInput('bindUser')}
                value={bindUser || ''}
                desc={t("Distinguished Name used for binding")}
                id="bindDn"
                name="bindDn"
                autoComplete="bindDn"
              />
              <LdapTextfield
                flex
                label={t('LDAP Bind Password')}
                onChange={handleInput('bindPass')}
                value={bindPass || ''}
                desc={t("ldap_password_desc")}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={starttls || false}
                    onChange={handleCheckbox('starttls')}
                    name="starttls"
                    inputProps={{
                      autoComplete: 'starttls',
                      name: 'starttls',
                      id: 'starttls',
                    }}
                    color="primary"
                  />
                }
                label={<span>
                  {'STARTTLS'}
                  <Tooltip
                    className={classes.tooltip}
                    title="Whether to issue a StartTLS extended operation"
                    placement="top"
                  >
                    <IconButton size="small">
                      <Help fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </span>}
              />
            </div>
            <LdapTextfield
              label={t('LDAP Base DN')}
              onChange={handleInput('baseDn')}
              value={baseDn || ''}
              desc={t("Base DN to use for searches")}
              id="baseDn"
              name="baseDn"
              autoComplete="baseDn"
            />
          </FormControl>
        </Paper>
        <Paper className={classes.ldapPaper} elevation={1}>
          <FormControl className={classes.formControl}>
            <Typography variant="h6" className={classes.category}>{t('Attribute Configuration')}</Typography>
            <LdapTextfield
              label={t('LDAP Template')}
              onChange={handleTemplate}
              value={templates}
              select
              desc={t("Mapping templates to use")}
              id="templates"
              name="templates"
              autoComplete="templates"
            >
              <MenuItem value='none'>{t('No template')}</MenuItem>
              <MenuItem value="OpenLDAP">OpenLDAP</MenuItem>
              <MenuItem value="ActiveDirectory">Active Directory</MenuItem>
              <MenuItem value="Univention">Univention</MenuItem>
              <MenuItem value="389ds">389DS / Red Hat Directory Server / FreeIPA</MenuItem>
            </LdapTextfield>
            <LdapTextfield
              label={t('LDAP Filter')}
              onChange={handleInput('filter')}
              value={filter || ''}
              desc={t("LDAP search filter to apply to user lookup")}
              id="filter"
              name="filter"
              autoComplete="filter"
            />
            <LdapTextfield
              label={t('LDAP Contact Filter')}
              onChange={handleInput('contactFilter')}
              value={contactFilter || ''}
              desc={t("LDAP search filter to apply to contact lookup")}
              id="contactFilter"
              name="contactFilter"
              autoComplete="contactFilter"
            />
            <LdapTextfield
              label={t('Unique Identifier Attribute')}
              onChange={handleInput('objectID')}
              value={objectID || ''}
              desc={t("ldap_oID_desc")}
              id="objectID"
              name="objectID"
              autoComplete="objectID"
            />
            <LdapTextfield
              label={t('Group name')}
              onChange={handleInput('groupname')}
              value={groupname || ''}
              desc={t("ldap_groupname")}
              id="groupname"
              name="groupname"
              autoComplete="groupname"
            />
            <LdapTextfield
              label={t('Group address')}
              onChange={handleInput('groupaddr')}
              value={groupaddr || ''}
              desc={t("ldap_groupaddr_desc")}
              id="groupaddr"
              name="groupaddr"
              autoComplete="groupaddr"
            />
            <LdapTextfield
              label={t('Group Member Attribute')}
              onChange={handleInput('groupMemberAttr')}
              value={groupMemberAttr || ''}
              desc={t("ldap_groupMemberAttr_desc")}
              id="groupMemberAttr"
              name="groupMemberAttr"
              autoComplete="groupMemberAttr"
            />
            <LdapTextfield
              label={t('Group filter')}
              onChange={handleInput('groupfilter')}
              value={groupfilter || ''}
              desc={t("ldap_groupfilter_desc")}
              id="groupfilter"
              name="groupfilter"
              autoComplete="groupfilter"
            />
            <LdapTextfield
              label={t('LDAP Username Attribute')}
              onChange={handleInput('username')}
              value={username || ''}
              desc={t("ldap_username_desc")}
              id="username"
              name="username"
              autoComplete="username"
            />
            <LdapTextfield
              label={t('LDAP Display Name Attribute')}
              onChange={handleInput('displayName')}
              value={displayName || ''}
              desc={t("Name of the attribute that contains the name")}
              id="displayName"
              name="displayName"
              autoComplete="displayName"
            />
            <LdapTextfield
              label={t('LDAP Default Quota')}
              onChange={handleInput('defaultQuota')}
              value={defaultQuota}
              desc={t("ldap_defaultQuota_desc")}
              id="defaultQuota"
              name="defaultQuota"
              autoComplete="defaultQuota"
            />
            <LdapTextfield
              label={t('LDAP Aliases')}
              onChange={handleInput('aliases')}
              value={aliases}
              desc={t("LDAP alias mapping")}
              id="aliasMapping"
              name="aliasMapping"
              autoComplete="aliasMapping"
            />
          </FormControl>
        </Paper>
        <Paper elevation={1} className={classes.ldapPaper}>
          <Typography variant="h6" className={classes.category}>{t('LDAP Search Attributes')}</Typography>
          <Typography variant="caption" className={classes.category}>
            {t('ldap_attribute_desc')}
          </Typography>
          <Autocomplete
            value={searchAttributes || []}
            onChange={handleAutocomplete('searchAttributes')}
            className={classes.textfield}
            options={adminConfig.searchAttributes}
            multiple
            renderInput={(params) => (
              <TextField
                {...params}
              />
            )}
          />
        </Paper>
        <Paper elevation={1} className={classes.ldapPaper}>
          <Typography variant="h6" className={classes.category}>
            {t('Custom Mapping')}
            <Tooltip
              className={classes.tooltip}
              title={t('ldap_mapping_desc')}
              placement="top"
            >
              <IconButton size="small">
                <Help fontSize="small"/>
              </IconButton>
            </Tooltip>
          </Typography>
          {attributes.map((mapping, idx) =>
            <Grid2 className={classes.attribute} container alignItems="center" key={idx}>
              <LdapTextfield
                label={t('Name')}
                flex
                onChange={handleAttributeInput('key', idx)}
                value={mapping.key || ''}
                desc={t("LDAP attribute to map")}
              />
              <Typography className={classes.spacer}>:</Typography>
              <LdapTextfield
                label={t('Value')}
                flex
                onChange={handleAttributeInput('value', idx)}
                value={mapping.value || ''}
                desc={t("Name of the user property to map to")}
              />
              <IconButton
                onClick={removeRow(idx)}
                className={classes.removeButton}
                size="large">
                <Delete color="error" />
              </IconButton>
            </Grid2>
          )}
          <Grid2 container justifyContent="center" className={classes.addButton}>
            <Button size="small" onClick={handleNewRow}>
              <Add color="primary" />
            </Button>
          </Grid2>
        </Paper>
        <div className={classes.bottomRow}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDelete}
            className={classes.deleteButton}
          >
            {t('Delete config')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={handleSaveLdap}
            disabled={!writable}
          >
            {t('Save')}
          </Button>
          <FormControlLabel
            className={classes.attribute}
            control={
              <Checkbox
                checked={force || false}
                onChange={handleCheckbox('force')}
                name="disabled"
                color="primary"
              />
            }
            label={<span>
              {t('Force config save')}
              <Tooltip
                className={classes.tooltip}
                title={t("Save LDAP configuration even if it's faulty")}
                placement="top"
              >
                <IconButton size="small">
                  <Help fontSize="small"/>
                </IconButton>
              </Tooltip>
            </span>}
          />
        </div>
      </form>}
      <DeleteConfig
        orgID={ID}
        delete={props.delete}
        open={deleting}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
      />
      <TaskCreated
        message={taskMessage}
        taskID={taskID}
        onClose={handleTaskClose}
      />
    </ViewWrapper>
  );
}

OrgDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  Domains: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  adminConfig: PropTypes.object.isRequired,
  put: PropTypes.func.isRequired,
  sync: PropTypes.func.isRequired,
  fetchLdap: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Domains: state.domains.Domains,
    adminConfig: state.config,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async org => await dispatch(editOrgData(org)).catch(message => Promise.reject(message)),
    fetch: async id => await dispatch(fetchOrgsDetails(id))
      .then(org => org)
      .catch(message => Promise.reject(message)),
    fetchDomains: async () => await dispatch(fetchDomainData({ sort: 'domainname,asc' })),
    fetchLdap: async (orgID, params) => await dispatch(fetchOrgLdapConfig(orgID, params))
      .then(config => config)
      .catch(message => Promise.reject(message)),
    put: async (orgID, config, params) => await dispatch(updateOrgLdapConfig(orgID, config, params))
      .then(msg => msg)
      .catch(message => Promise.reject(message)),
    sync: async (orgID, params) => await dispatch(syncOrgLdapUsers(orgID, params))
      .catch(message => Promise.reject(message)),
    delete: async orgID => await dispatch(deleteOrgLdapConfig(orgID)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(OrgDetails, styles)));
