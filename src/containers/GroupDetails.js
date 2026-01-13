// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect, useMemo, useState } from 'react';
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
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  List,
  ListItem,
  IconButton,
} from '@mui/material';
import { connect } from 'react-redux';
import { editGroupData, fetchGroupData } from '../actions/groups';
import { getStringAfterLastSlash } from '../utils';
import Feedback from '../components/Feedback';
import { DOMAIN_ADMIN_WRITE, LIST_PRIVILEGE, LIST_TYPE, listTypes, ORG_ADMIN, USER_STATUS, USER_TYPE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { editUserData, fetchAllUsers, fetchUsersData } from '../actions/users';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';
import User from '../components/user/User';
import Contact from '../components/user/Contact';
import { Badge, ContactMail, ContactPhone, Delete, SwitchAccount } from '@mui/icons-material';
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
  select: {
    minWidth: 60,
  },
  tabContainer: {
    marginTop: 8,
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  listTextfield: {
    flex: 1,
  },
});

// eslint-disable-next-line react/prop-types
const GroupTab = ({ icon: Icon, ...props}) => <Tab
  {...props}
  sx={{ minHeight: 48 }}
  iconPosition='start'
  icon={<Icon fontSize="small"/>}
/>

const GroupDetails = props => {
  const [state, setState] = useState({
    listname: '',
    displayname: '',
    hidden: 0,
    listType: LIST_TYPE.NORMAL,
    listPrivilege: LIST_PRIVILEGE.ALL,
    associations: [],
    specifieds: [],
    tab: window.location.hash ?
      (parseInt(window.location.hash.slice(1)) || 0) : 0,
    loading: true,
    user: {
      properties: {},
    },
    userDirty: false,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  useEffect(() => {
    const inner = async () => {
      const { domain, fetchUsers, fetchOrgUsers } = props;
      (context.includes(ORG_ADMIN) ? fetchOrgUsers(domain.orgID) : fetchUsers(domain.ID))
        .catch(message => {
          setState({ ...state, snackbar: message || 'Unknown error' });
        });
    }

    inner();
  }, []);

  useEffect(() => {
    const inner = async () => {
      const { fetch, Users } = props;
      const table = {};
      const group = await fetch(domain.ID, getStringAfterLastSlash())
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      Users.forEach(u => table[u.username] = u);
      if(group?.ID) {
        const associations = [];
        group.associations.forEach(groupUsername => {
          if(groupUsername in table) associations.push(table[groupUsername]);
        });

        const specifieds = [];
        group.specifieds.forEach(groupUsername => {
          if(groupUsername in table) specifieds.push(table[groupUsername]);
        });
        
        setState({
          ...state, 
          loading: false,
          ...group,
          associations: associations,
          specifieds: specifieds,
        });
      }
    };

    inner();
  }, [props.Users]);

  const listPrivileges = [
    { ID: LIST_PRIVILEGE.ALL, name: "All" },
    { ID: LIST_PRIVILEGE.INTERNAL, name: "Internal" },
    { ID: LIST_PRIVILEGE.DOMAIN, name: "Domain" },
    { ID: LIST_PRIVILEGE.SPECIFIC, name: "Specific" },
    { ID: LIST_PRIVILEGE.OUTGOING, name: "Outgoing (deprecated)" },
  ]

  const handlePrivilegeChange = event => {
    const { specifieds } = state;
    const val = event.target.value;
    setState({
      ...state, 
      listPrivilege: val,
      specifieds: val === 3 ? specifieds : [],
    });
  }

  const handleInput = field => event => {
    setState({
      ...state, 
      [field]: event.target.value,
    });
  }

  const handleEdit = () => {
    const { edit, domain, editUser } = props;
    const { ID, listname, hidden, displayname, listType, listPrivilege, associations, specifieds,
      user, userDirty } = state;
    edit(domain.ID, {
      ID,
      listname,
      listType,
      listPrivilege,
      displayname,
      hidden,
      associations: associations.map(user => user.username),
      specifieds: specifieds.map(user => user.username),
    })
      .then(() => {
        if(userDirty) editUser(domain.ID, {
          ID: user.ID,
          properties: user.properties,
          aliases: user.aliases
        })
          .then(() => setState({ ...state, snackbar: 'Success!' }))
          .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
        else setState({ ...state, snackbar: 'Success!' });
      })
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
  }

  const handleNavigation = path => event => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleCheckbox = field => (e) => setState({ ...state, [field]: e.target.checked ? 1 : 0 });

  const handleAutocomplete = (field) => (e, newVal) => {
    setState({
      ...state, 
      [field]: newVal || '',
    });
  }

  const handleTabChange = (_, tab) => {
    location.hash = '#' + tab;
    setState({ ...state, tab });
  }

  const handlePropertyChange = field => event => {
    const { user } = state;
    setState({
      ...state, 
      user: {
        ...user,
        properties: {
          ...user.properties,
          [field]: event.target.value,
        },
      },
      userDirty: true,
    });
  }

  const handleAliasEdit = (editType, idx) => event => {
    const { user } = state;
    const copy = [...user.aliases];
    switch(editType) {
    case "edit":
      copy[idx] = event.target.value;
      break;
    case "add":
      copy.push('');
      break;
    case "remove":
      copy.splice(idx, 1);
      break;
    default:
      return;
    }
    setState({
      ...state, 
      user: {
        ...user,
        aliases: copy
      },
      userDirty: true,
    });
  }

  const filteredUserOptions = useMemo(() => {
    return props.Users.filter(u => u.properties?.displaytypeex !== USER_TYPE.ROOM);
  }, [props.Users]);

  const { classes, t, domain } = props;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  const { tab, snackbar, listname, listType, displayname, hidden, listPrivilege, associations, specifieds,
    loading, user } = state;

  return (
    (<ViewWrapper
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
            {t('editHeadline', { item: 'Group' })}
          </Typography>
        </Grid2>
        <div className={classes.tabContainer}>
          <Tabs
            indicatorColor="primary"
            value={tab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            classes={{
              scroller: classes.scroller,
            }}
          >
            <GroupTab label={t("Group")} icon={SwitchAccount}/>
            <GroupTab label={t("Details")} icon={Badge}/>
            <GroupTab label={t("Contact")} icon={ContactPhone}/>
            <GroupTab label={t("SMTP")} icon={ContactMail}/>
          </Tabs>
        </div>
        {tab === 0 && <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Group name")} 
            fullWidth 
            value={listname}
            autoFocus
            required
            slotProps={{
              htmlInput: {
                disabled: true,
              }
            }}
          />
          <TextField 
            className={classes.input} 
            label={t("Displayname")} 
            fullWidth 
            value={displayname}
            onChange={handleInput('displayname')}
          />
          <FormControlLabel
            className={classes.input} 
            control={
              <Checkbox
                checked={hidden === 1}
                onChange={handleCheckbox('hidden')}
                color="primary"
              />
            }
            label={t('Hide from addressbook')}
          />
          <TextField
            select
            className={classes.input}
            label={t("Type")}
            fullWidth
            value={listType}
            slotProps={{
              htmlInput: {
                disabled: true,
              }
            }}
          >
            {listTypes.map((status, key) => (
              <MenuItem key={key} value={status.ID}>
                {t(status.name)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            className={classes.input}
            label={t("Privilege")}
            fullWidth
            value={listPrivilege}
            onChange={handlePrivilegeChange}
          >
            {listPrivileges.map((status, key) => (
              <MenuItem key={key} value={status.ID}>
                {t(status.name)}
              </MenuItem>
            ))}
          </TextField>
          {listType === LIST_TYPE.NORMAL && <MagnitudeAutocomplete
            getOptionDisabled={option => option.username === listname}
            multiple
            value={associations || []}
            filterAttribute={'username'}
            onChange={handleAutocomplete('associations')}
            className={classes.input} 
            options={filteredUserOptions || []}
            placeholder={t("Search users") +  "..."}
            label={t('Recipients')}
            getOptionLabel={user => {
              // Contact
              if(user.status === USER_STATUS.CONTACT) {
                const properties = user.properties || {};
                return properties["smtpaddress"] || properties["displayname"] || "";
              } else {
                return user.username
              }
            }}
            getOptionKey={(option) => `${option.ID}_${option.domainID}`}
            isOptionEqualToValue={(option, value) => option.ID === value.ID && option.domainID === value.domainID}
          />}
          {listPrivilege === LIST_PRIVILEGE.SPECIFIC && <MagnitudeAutocomplete
            getOptionDisabled={option => option.username === listname}
            multiple
            value={specifieds || []}
            filterAttribute={'username'}
            onChange={handleAutocomplete('specifieds')}
            className={classes.input} 
            options={filteredUserOptions || []}
            placeholder={t("Search users") +  "..."}
            label={t('Senders')}
            getOptionLabel={user => {
              // Contact
              if(user.status === USER_STATUS.CONTACT) {
                const properties = user.properties || {};
                return properties["smtpaddress"] || properties["displayname"] || "";
              } else {
                return user.username
              }
            }}
            getOptionKey={(option) => `${option.ID}_${option.domainID}`}
            isOptionEqualToValue={(option, value) => option.ID === value.ID && option.domainID === value.domainID}
          />}
        </FormControl>}
        {tab === 1 && <User
          user={user}
          handlePropertyChange={handlePropertyChange}
        />}
        {tab === 2 && <Contact
          user={user}
          handlePropertyChange={handlePropertyChange}
        />}
        {tab === 3 && <FormControl className={classes.form}>
          <Typography variant="h6">{t('E-Mail Addresses')}</Typography>
          <List className={classes.list}>
            {(user?.aliases || []).map((alias, idx) => <ListItem key={idx} className={classes.listItem}>
              <TextField
                className={classes.listTextfield}
                value={alias}
                label={t("Alias") + ' ' + (idx + 1)}
                onChange={handleAliasEdit("edit", idx)}
              />
              <IconButton onClick={handleAliasEdit("remove", idx)} size="large">
                <Delete color="error" />
              </IconButton>
            </ListItem>
            )}
          </List>
          <Grid2 container justifyContent="center">
            <Button variant="contained" onClick={handleAliasEdit("add")}>{t('addHeadline', { item: 'E-Mail' })}</Button>
          </Grid2>
        </FormControl>}
        <Button
          color="secondary"
          onClick={handleNavigation(domain.ID + '/groups')}
          style={{ marginRight: 8 }}
        >
          {t('Back')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleEdit}
          disabled={!writable}
        >
          {t('Save')}
        </Button>
      </Paper>
      <Feedback
        snackbar={snackbar}
        onClose={() => setState({ ...state, snackbar: '' })}
      />
    </ViewWrapper>)
  );
}

GroupDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchOrgUsers: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  editUser: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  Users: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    Users: state.users.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async (domainID, group) => {
      await dispatch(editGroupData(domainID, group)).catch(message => Promise.reject(message));
    },
    editUser: async (domainID, group) =>
      await dispatch(editUserData(domainID, group)).catch(message => Promise.reject(message)),
    fetch: async (domainID, id) => await dispatch(fetchGroupData(domainID, id))
      .then(group => group)
      .catch(message => Promise.reject(message)),
    fetchUsers: async (domainID) =>
      await dispatch(fetchUsersData(domainID, { limit: 100000, sort: "username,asc" }))
        .catch(message => Promise.reject(message)),
    fetchOrgUsers: async orgID => await dispatch(fetchAllUsers({ limit: 100000, sort: "username,asc", orgID }))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(GroupDetails, styles)));
