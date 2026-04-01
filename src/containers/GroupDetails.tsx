// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
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
  Theme,
} from '@mui/material';
import { editGroupData, fetchGroupData } from '../actions/groups';
import { getStringAfterLastSlash } from '../utils';
import Feedback from '../components/Feedback';
import { DOMAIN_ADMIN_WRITE, LIST_PRIVILEGE, LIST_TYPE, listTypes, ORG_ADMIN, USER_TYPE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import ViewWrapper from '../components/ViewWrapper';
import { editUserData, fetchAllUsers, fetchUsersData } from '../actions/users';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';
import User from '../components/user/User';
import Contact from '../components/user/Contact';
import { Badge, ContactMail, ContactPhone, Delete, SwitchAccount } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { ChangeEvent, DomainViewProps } from '@/types/common';
import { useAppDispatch, useAppSelector } from '../store';
import { UpdateGroup } from '@/types/groups';
import { UpdateUser, UserListItem, UserProperties, User as UserType } from '@/types/users';


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
}));

// eslint-disable-next-line react/prop-types
const GroupTab = ({ icon: Icon, ...props }: any) => <Tab
  {...props}
  sx={{ minHeight: 48 }}
  iconPosition='start'
  icon={<Icon fontSize="small"/>}
/>

interface GroupDetailsState {
  ID: number;
  listname: string;
  displayname: string;
  hidden: number;
  listType: number;
  listPrivilege: number;
  associations: UserListItem[];
  specifieds: UserListItem[];
  tab: number;
  loading: boolean;
  user: UserType;
  userDirty: boolean;
  snackbar: string;
}

const GroupDetails = ({ domain }: DomainViewProps) => {1
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { Users } = useAppSelector(state => state.users);
  const [state, setState] = useState<GroupDetailsState>({
    ID: 0,
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
    } as UserType,
    userDirty: false,
    snackbar: "",
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const edit = async (domainID: number, group: UpdateGroup) => await dispatch(editGroupData(domainID, group));
  const editUser = async (domainID: number, group: UpdateUser) => await dispatch(editUserData(domainID, group));
  const fetch = async (domainID: number, id: number) => await dispatch(fetchGroupData(domainID, id));
  const fetchUsers = async (domainID: number) =>
    await dispatch(fetchUsersData(domainID, { limit: 100000, sort: "username,asc" }));
  const fetchOrgUsers = async (orgID?: number) =>
    await dispatch(fetchAllUsers({ limit: 100000, sort: "username,asc", orgID }));

  useEffect(() => {
    const inner = async () => {
      (context.includes(ORG_ADMIN) && domain.orgID ? fetchOrgUsers(domain.orgID) : fetchUsers(domain.ID))
        .catch(message => {
          setState({ ...state, snackbar: message || 'Unknown error' });
        });
    }

    inner();
  }, []);

  useEffect(() => {
    const inner = async () => {
      const table: Record<string, UserType> = {};
      const group = await fetch(domain.ID, parseInt(getStringAfterLastSlash()))
        .catch(message => setState({ ...state, snackbar: message || 'Unknown error' }));
      Users.forEach((u: UserType) => table[u.username] = u);
      if(group?.ID) {
        const associations: UserType[] = [];
        group.associations.forEach((groupUsername: string) => {
          if(groupUsername in table) associations.push(table[groupUsername]);
        });

        const specifieds: UserType[] = [];
        group.specifieds.forEach((groupUsername: string) => {
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
  }, [Users]);

  const listPrivileges = [
    { ID: LIST_PRIVILEGE.ALL, name: "All" },
    { ID: LIST_PRIVILEGE.INTERNAL, name: "Internal" },
    { ID: LIST_PRIVILEGE.DOMAIN, name: "Domain" },
    { ID: LIST_PRIVILEGE.SPECIFIC, name: "Specific" },
    { ID: LIST_PRIVILEGE.OUTGOING, name: "Outgoing (deprecated)" },
  ];

  const handlePrivilegeChange = (event: ChangeEvent) => {
    const { specifieds } = state;
    const val = parseInt(event.target.value);
    setState({
      ...state, 
      listPrivilege: val,
      specifieds: val === 3 ? specifieds : [],
    });
  }

  const handleInput = (field: string) => (event: ChangeEvent) => {
    setState({
      ...state, 
      [field]: event.target.value,
    });
  }

  const handleEdit = () => {
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

  const handleNavigation = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleCheckbox = (field: string) => (e: ChangeEvent) => setState({ ...state, [field]: e.target.checked ? 1 : 0 });

  const handleAutocomplete = (field: string) => (_: any, newVal: UserType) => {
    setState({
      ...state, 
      [field]: newVal || '',
    });
  }

  const handleTabChange = (_: unknown, tab: number) => {
    location.hash = '#' + tab;
    setState({ ...state, tab });
  }

  const handlePropertyChange = (field: keyof UserProperties) => (event: ChangeEvent) => {
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

  // TODO: Fix typing
  const handleAliasEdit = (editType: 'edit' | 'add' | 'remove', idx: number) => (event: any) => {
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
    return Users.filter((u: UserType) => u.properties?.displaytypeex !== USER_TYPE.ROOM);
  }, [Users]);

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
          <List>
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
            <Button variant="contained" onClick={handleAliasEdit("add", 0)}>
              {t('addHeadline', { item: 'E-Mail' })}
            </Button>
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


export default GroupDetails;
