// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2026-2026 grommunio GmbH


import { useAppDispatch, useAppSelector } from "../store";
import { ChangeEvent, KeyValuePair } from "@/types/common";
import { LdapConfigData, LdapTemplate, SyncLdapParams } from "@/types/ldap";
import { arrayToObject, objectToArray } from "../utils";
import { Add, Delete, Help } from "@mui/icons-material";
import { Autocomplete, Button, Checkbox, FormControl, FormControlLabel, Grid2, IconButton, MenuItem, Paper, Switch, TextField, Theme, Tooltip, Typography } from "@mui/material";
import { green, red } from "@mui/material/colors";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";
import DeleteConfig from "./Dialogs/DeleteConfig";
import { deleteOrgLdapConfig, fetchOrgLdapConfig, syncOrgLdapUsers, updateOrgLdapConfig } from "../actions/ldap";
import TaskCreated from "./Dialogs/TaskCreated";
import LdapTextfield from "./LdapTextfield";
import { CapabilityContext } from "../CapabilityContext";
import PropTypes from "prop-types";
import { ORG_ADMIN } from "../constants";
import Feedback from "./Feedback";


const useStyles = makeStyles()((theme: Theme) => ({
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
  ldapPaper: {
    margin: theme.spacing(3, 2, 1, 2),
    paddingBottom: 16,
  },
}));

interface IOrgLdapState {
  baseDn: string;
  objectID: string;
  disabled: boolean;
  
  server: string;
  bindUser: string;
  bindPass: string;
  starttls: boolean;

  groupMemberAttr: string;
  groupaddr: string;
  groupfilter: string;
  groupname: string;

  username: string;
  displayName: string;
  defaultQuota: string;
  filter: string;
  contactFilter: string;
  templates: string;
  attributes: KeyValuePair<string>[];
  searchAttributes: string[];
  authBackendSelection: string;
  aliases: string;
}

interface IOrgLdap {
  orgID: number,
  noHeader?: boolean
  resolveLoading?: () => void
}

const OrgLdap = ({ orgID, noHeader, resolveLoading }: IOrgLdap) => {
  const context = useContext(CapabilityContext);
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const adminConfig = useAppSelector(state => state.config);
  
  const fetchLdap = async (orgID: number) => await dispatch(fetchOrgLdapConfig(orgID));
  const put = async (orgID: number, config: LdapConfigData, params: { force: boolean }) =>
    await dispatch(updateOrgLdapConfig(orgID, config, params));
  const sync = async (orgID: number, params: SyncLdapParams) =>
    await dispatch(syncOrgLdapUsers(orgID, params));
  const deleteItem = async (orgID: number) => await dispatch(deleteOrgLdapConfig(orgID));

  const [state, setState] = useState<IOrgLdapState>({
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
  });
  const [task, setTask] = useState({
    taskMessage: "",
    taskID: -1,
  })
  const [available, setAvailable] = useState<boolean>(false);
  const [force, setForce] = useState(false);
  const [snackbar, setSnackbar] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if(!orgID) return;
    (async () => {
      // Fetch and format organisation LDAP config
      const ldap = await fetchLdap(orgID)
        .catch(() => null);
      const config = ldap?.data || {};
      setAvailable(ldap?.ldapAvailable || false);
      const connection = config?.connection || {};
      const groups = config?.groups || {};
      const users = config?.users || {};
      setState({
        ...state,
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
        templates: users.templates && users.templates.length > 1 ? users.templates[1] : 'none',
        searchAttributes: (users.searchAttributes || []).filter((sa: string) => sa),
        attributes: objectToArray(users.attributes || {}),
        aliases: users.aliases || '',
      });
      if(resolveLoading) resolveLoading();
    })();
  }, [orgID]);

  const handleSaveLdap = (e: React.MouseEvent | React.SubmitEvent) => {
    e.preventDefault();
    put(orgID, formatData(), { force })
      .then(async resp => {
        setSnackbar('Success! ' + (resp?.message || ''));
        // Recheck connection
        const res = await fetchLdap(orgID)
          .catch(snackbar => setSnackbar(snackbar));
        setAvailable(res?.ldapAvailable || false);
      })
      .catch(snackbar => setSnackbar(snackbar));
  }

  const handleInput = (field: string) => (event: ChangeEvent) => {
    setState({
      ...state, 
      [field]: event.target.value,
    });
  }

  const handleAutocomplete = (field: string) => (_: unknown, newVal: string[]) => {
    setState({
      ...state, 
      [field]: newVal,
    });
  }

  const handleCheckbox = (field: keyof typeof state) => () => setState({
    ...state, 
    [field]: !state[field],
  });

  const handleTemplate = ({ target: t }: ChangeEvent) => {
    const templates = t.value as LdapTemplate;
    if(templates === 'ActiveDirectory') {
      setState({
        ...state, 
        templates,
        objectID: 'objectGUID',
        username: 'mail',
        displayName: 'displayName',
        searchAttributes: ["mail", "givenName", "cn", "sn", "name", "displayName"],
        filter: '(objectClass=user)',
        contactFilter: '(objectclass=contact)',
        aliases: 'proxyAddresses',
        groupMemberAttr: "memberOf",
        groupaddr: "mail",
        groupfilter: '(objectclass=group)',
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
        filter: '(objectClass=posixAccount)',
        contactFilter: '(&(|(objectclass=person)(objectclass=inetOrgPerson))(!(objectclass=posixAccount))(!(objectclass=shadowAccount)))',
        aliases: 'mailAlternativeAddress',
        groupMemberAttr: "memberOf",
        groupaddr: "mailPrimaryAddress",
        groupfilter: '(objectclass=posixgroup)',
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
        filter: '(objectClass=posixAccount)',
        contactFilter: '(&(|(objectclass=person)(objectclass=inetOrgPerson))(!(objectclass=posixAccount))(!(objectclass=shadowAccount)))',
        aliases: 'mailAlternativeAddress',
        groupMemberAttr: "memberOf",
        groupaddr: "mailPrimaryAddress",
        groupfilter: '(objectclass=posixgroup)',
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
        filter: '(objectClass=posixAccount)',
        contactFilter: '(&(|(objectclass=person)(objectclass=inetOrgPerson))(!(objectclass=posixAccount)))',
        aliases: 'mailAlternateAddress',
        groupMemberAttr: "memberOf",
        groupaddr: "mail",
        groupfilter: '(objectclass=posixGroup)',
        groupname: "cn",
      });
    } else {
      setState({ ...state, templates });
    }
  }
  
  /* Formats state to new config object for backend */
  const formatData = () => {
    const copy = structuredClone(state);
  
    return {
      baseDn: copy.baseDn,
      objectID: copy.objectID,
      disabled: copy.disabled,
  
      connection: {
        server: copy.server,
        bindUser: copy.bindUser,
        bindPass: copy.bindPass,
        starttls: copy.starttls,
      },
  
      groups: {
        groupMemberAttr: copy.groupMemberAttr,
        groupaddr: copy.groupaddr,
        groupfilter: copy.groupfilter,
        groupname: copy.groupname,
      },
  
      users: {
        username: copy.username,
        displayName: copy.displayName,
        attributes: arrayToObject<string>([...copy.attributes]),
        defaultQuota: parseInt(copy.defaultQuota) || undefined,
        filter: copy.filter,
        contactFilter: copy.contactFilter,
        templates:
          !copy.templates || copy.templates === 'none'
            ? []
            : ['common', copy.templates],
        searchAttributes: [...state.searchAttributes],
        aliases: copy.aliases,
      },
    };
  };

  const handleAttributeInput = (objectPart: 'key' | 'value', idx: number) => ({ target: t }: ChangeEvent) => {
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
  
  const removeRow = (idx: number) => () => {
    const copy = [...state.attributes];
    copy.splice(idx, 1);
    setState({ ...state, attributes: copy });
  }
  
  const handleDelete = () => setDeleting(true);
  
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
    });
    setSnackbar("Success!");
    setDeleting(false);
  }
  
  const handleDeleteClose = () => setDeleting(false);
  
  const handleDeleteError = (error: string) => setSnackbar(error);

  const handleTaskClose = () => setTask({
    ...state, 
    taskMessage: "",
    taskID: -1,
  });
  
  const handleSync = (importUser: boolean) => () =>
    sync(orgID, { import: importUser })
      .then(response => {
        if(response?.taskID) {
          setTask({
            ...task, 
            taskMessage: response.message || 'Task created',
            taskID: response.taskID,
          });
        } else {
          setSnackbar('Success! ' + (response?.message || ''));
        }
      })
      .catch(snackbar => setSnackbar(snackbar));

  const { server, bindUser,
    bindPass, starttls, baseDn, objectID, disabled, groupMemberAttr, groupaddr, groupfilter, groupname,
    username, filter, contactFilter, templates, attributes, defaultQuota, displayName, searchAttributes,
    aliases } = state;
  const writable = context.includes(ORG_ADMIN);

  return <>
    <form className={classes.base} onSubmit={handleSaveLdap}>
      {!noHeader && <Typography variant="h2" className={classes.pageTitle}>
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
      </Typography>}
      {!noHeader && <Typography variant="caption" className={classes.subtitle}>
        {t('ldap_sub')}
      </Typography>}
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
              autoComplete="new-password"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={starttls || false}
                  onChange={handleCheckbox('starttls')}
                  name="starttls"
                  slotProps={{
                    input: {
                      autoComplete: 'starttls',
                      name: 'starttls',
                      id: 'starttls',
                    }
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
              onChange={() => setForce(!force)}
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
    </form>
    <DeleteConfig
      orgID={orgID}
      delete={deleteItem}
      open={deleting}
      onSuccess={handleDeleteSuccess}
      onError={handleDeleteError}
      onClose={handleDeleteClose}
    />
    <TaskCreated
      message={task.taskMessage}
      taskID={task.taskID}
      onClose={handleTaskClose}
    />
    <Feedback
      snackbar={snackbar || ''}
      onClose={() => setSnackbar("")}
    />
  </>
};

OrgLdap.propTypes = {
  orgID: PropTypes.number.isRequired,
  noHeader: PropTypes.bool,
}

export default OrgLdap;
