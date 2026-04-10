// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid2, TableSortLabel,
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  Theme} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import { fetchAllUsers, fetchUserData } from '../actions/users';
import DeleteUser from '../components/Dialogs/DeleteUser';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE, userTypes } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import AddGlobalUser from '../components/Dialogs/AddGlobalUser';
import SearchTextfield from '../components/SearchTextfield';
import { generatePropFilterString, getUserTypeString } from '../utils';
import { AccountCircle, Groups } from '@mui/icons-material';
import TableActionGrid from '../components/TableActionGrid';
import { setFilterState } from '../actions/globalUsers';
import { useAppDispatch, useAppSelector } from '../store';
import { useTable } from '../hooks/useTable';
import { FetchUserParams, USER_STATUS, USER_TYPE, UserListItem } from '../types/users';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { ChangeEvent } from '@/types/common';


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

const columns = [
  { label: 'Type', value: 'type' },
  { label: 'Display name', value: 'displayname' },
  { label: 'LDAP ID', value: 'ldapID' },
];


const GlobalUsers = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showDeactivated, match, mode, type } = useAppSelector(state => state.globalUsers);
  const { Users, count } = useAppSelector(state => state.users);
  const context = useContext(CapabilityContext);

  const fetchTableData = async (params: FetchUserParams) => {
    await dispatch(fetchAllUsers({ ...params }));
  };

  const fetchUserDetails = async (domainID: number, userID: number) =>
    await dispatch(fetchUserData(domainID, userID));

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
  } = table;

  const getUserStatuses = () => {
    const statuses = [];
    if(showDeactivated) statuses.push(USER_STATUS.DEACTIVATED);
    if(mode === USER_STATUS.NORMAL) {
      statuses.push(USER_STATUS.NORMAL, USER_STATUS.SHARED);
    }
    else if(mode === USER_STATUS.SHARED) statuses.push(USER_STATUS.SHARED);
    else statuses.push(USER_STATUS.NORMAL);
    return statuses;
  }

  const getFilterProp = () => (
    generatePropFilterString({
      displaytypeex: type === USER_TYPE.ALL ? userTypes.map(t => t.ID) : type,
    })
  );

  useEffect(() => {
    fetchTableData({
      sort: orderBy + "," + order,
      filterProp: getFilterProp(),
      status: getUserStatuses(),
      match: match || undefined,
    })
      .catch(err => err);
  }, [showDeactivated, mode, type, match]);

  const handleScroll = () => {
    table.handleScroll(Users, count, {
      filterProp: getFilterProp(),
      status: getUserStatuses(),
      match: match || undefined,
    });
  };

  const handleRedirect = (obj: UserListItem) => async (e: React.MouseEvent) => {
    // If user is a group
    if(obj.properties?.displaytypeex === USER_TYPE.GROUP) {
      const userDetails = await fetchUserDetails(obj.domainID, obj.ID);
      handleEdit('/' + obj.domainID +'/groups/' + userDetails.mlist)(e);
    } else {
      handleEdit('/' + obj.domainID +'/users/' + obj.ID)(e);
    }
  }

  const handleSort = (orderBy: string) => () => {
    table.handleRequestSort(orderBy, {
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
  const writable = context.includes(SYSTEM_ADMIN_WRITE);

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
      subtitle={t("globalusers_sub")}
      href="https://docs.grommunio.com/admin/administration.html#users"
      snackbar={snackbar}
      onSnackbarClose={clearSnackbar}
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
      </TableActionGrid>
      <div className={classes.filterRow}>
        <TextField
          label="Mode"
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
          label="Type"
          select
          value={type}
          onChange={handleSelect("type")}
          size='small'
          sx={{ width: 100, mr: 1 }}
        >
          <MenuItem value={USER_TYPE.ALL}>All</MenuItem>
          <MenuItem value={USER_TYPE.USER}>Normal</MenuItem>
          <MenuItem value={USER_TYPE.ROOM}>Room</MenuItem>
          <MenuItem value={USER_TYPE.EQUIPMENT}>Equipment</MenuItem>
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
        {` (${userCounts.normal} ${t("normal")}, ${userCounts.group} ${t("groups")}, ${userCounts.shared} ${t("shared")})`}
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
                  <TableRow key={idx} hover onClick={handleRedirect(obj)}>
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
                      {obj.status === USER_STATUS.DEACTIVATED && ` (${t("Deactivated")})`}
                    </TableCell>
                    <TableCell>{properties.displayname}</TableCell>
                    <TableCell>{obj.ldapID || ''}</TableCell>
                    <TableCell align="right">
                      {writable && <IconButton onClick={handleDelete(obj)} size="small">
                        <Delete color="error" fontSize='small'/>
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
                onClick={handleEdit('/' + obj.domainID + '/users/' +  obj.ID)}
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
          <Button
            variant='outlined'
            size='small'
            sx={{ m: 1 }}
            onClick={handleScroll}
          >
            Load more
          </Button>
          <CircularProgress color="primary" className={classes.circularProgress}/>
        </Grid2>}
      </Paper>
      <AddGlobalUser
        open={adding}
        onSuccess={handleAddingSuccess}
        onError={handleAddingError}
        onClose={handleAddingClose}
      />
      <DeleteUser
        open={!!deleting}
        onSuccess={handleDeleteSuccess}
        onClose={handleDeleteClose}
        onError={handleDeleteError}
        user={deleting}
        domainID={deleting.domainID || -1}
      />
    </TableViewContainer>
  );
}


export default GlobalUsers;
