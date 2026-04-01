// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid2, TableSortLabel,
  CircularProgress, Tooltip, List, ListItemButton, ListItemText, ListItemIcon, 
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  Theme} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import { fetchUsersData, checkLdapUsers, setFilterState } from '../actions/users';
import { syncLdapUsers } from '../actions/ldap';
import AddUser from '../components/Dialogs/AddUser';
import DeleteUser from '../components/Dialogs/DeleteUser';
import CheckLdapDialog from '../components/Dialogs/CheckLdapDialog';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE, USER_STATUS, USER_TYPE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import TaskCreated from '../components/Dialogs/TaskCreated';
import SearchTextfield from '../components/SearchTextfield';
import { generatePropFilterString, getUserTypeString } from '../utils';
import { AccountCircle, Groups } from '@mui/icons-material';
import TableActionGrid from '../components/TableActionGrid';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../store';
import { useTranslation } from 'react-i18next';
import { useTable } from '../hooks/useTable';
import { FetchUserParams, UserListItem } from '@/types/users';
import { makeStyles } from 'tss-react/mui';
import { CheckLdapUsersParams, SyncLdapParams } from '@/types/ldap';
import { ChangeEvent, DomainViewProps } from '@/types/common';


const useStyles = makeStyles()((theme: Theme) => ({
  tablePaper: {
    margin: theme.spacing(3, 2, 3, 2),
    borderRadius: 6,
  },
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  newButton: {
    marginRight: 8,
  },
  count: {
    marginLeft: 16,
  },
  barBackground: {
    width: '100%',
    height: 20,
    backgroundColor: '#ddd',
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  filterRow: {
    display: 'flex',
    marginLeft: 16,
  }
}));


const Users = ({ domain }: DomainViewProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    snackbar: '',
    checking: false,
    taskMessage: '',
    taskID: -1,
  });
  const { Users, count, showDeactivated, match, mode, type } = useAppSelector(state => state.users);
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const fetchTableData = async (domainID: number, params: FetchUserParams) =>
    await dispatch(fetchUsersData(domainID, {...params }));
  const check = async (params: CheckLdapUsersParams) => await dispatch(checkLdapUsers(params));
  const sync = async (params: SyncLdapParams, domainID: number) => await dispatch(syncLdapUsers(params, domainID));

  const table = useTable<UserListItem>({
    fetchTableData,
    defaultState: { orderBy: 'username', suppressFetch: true },
  });

  const {
    tableState,
    clearSnackbar,
    handleAdd,
    handleAddingSuccess,
    handleAddingClose,
    handleAddingError,
    handleDelete,
    handleDeleteClose,
    handleDeleteError,
    handleDeleteSuccess,
    handleEdit,
    handleRequestSort,
  } = table;

  const columns = [
    { label: 'Type', value: 'type' },
    { label: 'Display name', value: 'displayname' },
    { label: 'LDAP ID', value: 'ldapID' },
    { label: 'Storage quota limit', value: 'storagequotalimit' },
  ];

  const getUserStatuses = (): number[] => {
    const statuses = [];
    if(showDeactivated) statuses.push(USER_STATUS.DEACTIVATED);
    if(mode === USER_STATUS.NORMAL) {
      statuses.push(USER_STATUS.NORMAL, USER_STATUS.SHARED);
    }
    else if(mode === USER_STATUS.SHARED) statuses.push(USER_STATUS.SHARED);
    else statuses.push(USER_STATUS.NORMAL);
    return statuses;
  }

  const getFilterProp = () => (generatePropFilterString({ displaytypeex: type }));

  const handleScroll = () => {
    table.handleScroll(Users, count, {
      filterProp: getFilterProp(),
      status: getUserStatuses(),
      match: match || undefined,
    });
  };

  useEffect(() => {
    fetchTableData(domain.ID, {
      sort: orderBy + "," + order,
      filterProp: getFilterProp(),
      status: getUserStatuses(),
      match: match || undefined,
    })
      .catch(err => err);
  }, [showDeactivated, mode, type, match]);

  const handleNavigation = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const getMaxSizeFormatting = (size?: number) => {
    if(!size) return '';
    if(size % 1073741824 === 0) {
      return size / 1073741824 + ' TB';
    } else if (size % 1048576 === 0) {
      return size / 1048576 + ' GB';
    } else if (size % 1024 === 0) {
      return size / 1024 + ' MB';
    } else {
      return size + ' KiB';
    }
  }

  const handleUserSync = (importUsers: boolean) => () => {
    sync({ import: importUsers }, domain.ID)
      .then(response => {
        if(response?.taskID) {
          // Background task was created -> Show task dialog
          setState({
            ...state,
            taskMessage: response.message || 'Task created',
            taskID: response.taskID,
          });
        } else {
          // No task created -> Reload table data
          const { order, orderBy, match } = tableState;
          setState({ ...state, snackbar: 'Success!' });
          fetchTableData(domain.ID, {
            sort: orderBy + ',' + order,
            filterProp: getFilterProp(),
            status: getUserStatuses(),
            match: match || undefined,
          })
            .catch(msg => setState({ ...state, ...state,snackbar: msg }));
        }
      })
      .catch(msg => setState({ ...state, snackbar: msg }));
  }

  const handleTaskClose = () => setState({
    ...state,
    taskMessage: "",
    taskID: -1,
  })

  const checkUsers = () => {
    check({ domain: domain.ID })
      .catch(msg => setState({ ...state, snackbar: msg }));
    setState({ ...state, checking: true });
  }

  const handleCheckClose = () => setState({ ...state, checking: false });

  const handleCheckSuccess = () => {
    fetchTableData(domain.ID, {
      sort: orderBy + ',' + order,
      filterProp: getFilterProp(),
      status: getUserStatuses(),
      match: match || undefined,
    })
      .then(() => setState({ ...state, checking: false }))
      .catch(msg => setState({ ...state, snackbar: msg, checking: false }));
  };

  const handleSnackbarClose = () => {
    setState({ ...state, snackbar: '' });
    clearSnackbar();
  }

  const handleSort = (orderBy: string) => () => {
    handleRequestSort(orderBy, {
      filterProp: getFilterProp(),
      status: getUserStatuses(),
      match: match || undefined,
    })();
  }

  const handleSelect = (field: string) => (e: ChangeEvent) => {
    dispatch(setFilterState(field, e.target.value));
  };

  const handleMatch = (e: ChangeEvent) => {
    dispatch(setFilterState("match", e.target.value));
  };

  const { loading, order, orderBy, snackbar, adding, deleting } = tableState;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  const { checking, taskMessage, taskID } = state;

  const userCounts = Users.reduce((prev: { normal: number, group: number, shared: number }, curr: UserListItem) => {
    const isGroup = curr.properties?.displaytypeex === USER_TYPE.GROUP;
    const shared = curr.status === USER_STATUS.SHARED;
    return {
      normal: prev.normal + (!shared && !isGroup ? 1 : 0),
      group: prev.group + (isGroup ? 1 : 0),
      shared: prev.shared + (shared && !isGroup ? 1 : 0),
    }
  }, { normal: 0, group: 0, shared: 0 });

  const lgUpHidden = useMediaQuery(theme => theme.breakpoints.up('lg'));
  const lgDownHidden = useMediaQuery(theme => theme.breakpoints.down('lg'));

  return (
    <TableViewContainer
      handleScroll={handleScroll}
      headline={t("Users")}
      subtitle={t('users_sub')}
      href="https://docs.grommunio.com/admin/administration.html#users"
      snackbar={snackbar || state.snackbar}
      onSnackbarClose={handleSnackbarClose}
      loading={loading}
    >
      <TableActionGrid
        tf={<SearchTextfield
          value={match}
          onChange={handleMatch}
          placeholder={t("Search users")}
        />}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          className={classes.newButton}
          disabled={!writable}
        >
          {t('New user')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNavigation(domain.ID + '/ldap')}
          className={classes.newButton}
          disabled={!writable}
        >
          {t('Search in LDAP')}
        </Button>
        <Tooltip placement="top" title={t("Synchronize imported users for this domain")}>
          <Button
            variant="contained"
            color="primary"
            className={classes.newButton}
            onClick={handleUserSync(false)}
            disabled={!writable}
          >
            {t('Sync LDAP')}
          </Button>
        </Tooltip>
        <Tooltip
          placement="top"
          title={t("Import new users from LDAP for this domain") + " " + t("and synchronize previously imported ones")}
        >
          <Button
            variant="contained"
            color="primary"
            className={classes.newButton}
            onClick={handleUserSync(true)}
            disabled={!writable}
          >
            {t('Import LDAP')}
          </Button>
        </Tooltip>
        <Tooltip
          placement="top"
          title={t("Check status of imported users of this domain")}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={checkUsers}
            disabled={!writable}
          >
            {t('Check LDAP')}
          </Button>
        </Tooltip>
      </TableActionGrid>
      <div className={classes.filterRow}>
        <TextField
          label={t("Mode")}
          select
          value={mode}
          onChange={handleSelect("mode")}
          size='small'
          sx={{ width: 100, mr: 1 }}
        >
          <MenuItem value={0}>All</MenuItem>
          <MenuItem value={1}>Normal</MenuItem>
          <MenuItem value={4}>Shared</MenuItem>
        </TextField>
        <TextField
          label={t("Type")}
          select
          value={type}
          onChange={handleSelect("type")}
          size='small'
          sx={{ width: 100, mr: 1 }}
        >
          <MenuItem value={0}>Normal</MenuItem>
          <MenuItem value={7}>Room</MenuItem>
          <MenuItem value={8}>Equipment</MenuItem>
        </TextField>
        <FormControlLabel
          control={<Checkbox
            checked={showDeactivated}
            onChange={() => dispatch(setFilterState("showDeactivated", !showDeactivated))}
          />}
          label="Show deactivated"
        />
      </div>
      <Typography className={classes.count} color="textPrimary">
        {t("showingUser", { count: Users.length })}
        {` (${userCounts.normal} ${t("normal")}, ${userCounts.shared} ${t("shared")})`}
      </Typography>
      <Paper className={classes.tablePaper} elevation={1}>
        {!lgDownHidden &&
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'username'}
                    direction={orderBy === 'username' ? order : 'asc'}
                    onClick={handleSort('username')}
                    color="primary"
                    sx={{
                      color: 'text.primary',
                    }}
                  >
                    {t('Username')}
                  </TableSortLabel>
                </TableCell>
                {columns.map(column =>
                  <TableCell key={column.value}>
                    {t(column.label)}
                  </TableCell>
                )}
                <TableCell padding="checkbox"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Users.map((obj: UserListItem, idx: number) => {
                const properties = obj.properties || {};
                return (
                  <TableRow
                    key={idx}
                    hover
                    onClick={handleEdit('/' + domain.ID + '/users/' +  obj.ID)} /* TODO: Redundant */
                  >
                    <TableCell>
                      <div className={classes.flexRow}>
                        {properties.displaytypeex === USER_TYPE.GROUP ?
                          <Groups className={classes.icon} fontSize='small'/> :
                          <AccountCircle className={classes.icon} fontSize='small'/>
                        }
                        {obj.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      {t(getUserTypeString(properties.displaytypeex))}
                      {obj.status === USER_STATUS.SHARED && ` (${t("Shared")})`}
                    </TableCell>
                    <TableCell>{properties.displayname}</TableCell>
                    <TableCell>{obj.ldapID || ''}</TableCell>
                    <TableCell>
                      {properties.storagequotalimit && properties.storagequotalimit >= 0 ?
                        getMaxSizeFormatting(properties.storagequotalimit) : "0 MB"}
                    </TableCell>
                    <TableCell align="right">
                      {writable && <IconButton onClick={handleDelete(obj)} size="small">
                        <Delete color="error" fontSize="small"/>
                      </IconButton>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>}
        {!lgUpHidden &&
          <List>
            {Users.map((obj: UserListItem, idx: number) => 
              <ListItemButton
                key={idx}
                onClick={handleEdit('/' + domain.ID + '/users/' + obj.ID)}
                divider
              >
                <ListItemIcon>
                  {obj.properties?.displaytypeex === USER_TYPE.GROUP ?
                    <Groups className={classes.icon} fontSize='small'/> :
                    <AccountCircle className={classes.icon} fontSize='small'/>
                  }
                </ListItemIcon>
                <ListItemText
                  primary={obj.username || ''}
                  secondary={obj.properties?.displayname || ''}
                />
              </ListItemButton>
            )}
          </List>}
        {(Users.length < count) && <Grid2 container justifyContent="center">
          <CircularProgress color="primary" className={classes.circularProgress}/>
        </Grid2>}
      </Paper>
      <AddUser
        open={adding}
        onSuccess={handleAddingSuccess}
        onError={handleAddingError}
        domain={domain}
        onClose={handleAddingClose}
      />
      <DeleteUser
        open={!!deleting}
        onSuccess={handleDeleteSuccess}
        onClose={handleDeleteClose}
        onError={handleDeleteError}
        domainID={domain.ID}
        user={deleting}
      />
      <CheckLdapDialog
        open={checking}
        onClose={handleCheckClose}
        onSuccess={handleCheckSuccess}
        onError={handleDeleteError}
        checkUsers={checkUsers}
      />
      <TaskCreated
        message={taskMessage}
        taskID={taskID}
        onClose={handleTaskClose}
      />
    </TableViewContainer>
  );
}


export default Users;
