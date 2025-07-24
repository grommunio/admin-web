// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
  useMediaQuery} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import { deleteUserData, checkLdapUsers, fetchAllUsers, fetchUserData } from '../actions/users';
import { syncLdapUsers } from '../actions/ldap';
import DeleteUser from '../components/Dialogs/DeleteUser';
import CheckLdapDialog from '../components/Dialogs/CheckLdapDialog';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import AddGlobalUser from '../components/Dialogs/AddGlobalUser';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import withStyledReduxTable from '../components/withTable';
import SearchTextfield from '../components/SearchTextfield';
import { generatePropFilterString, getUserTypeString } from '../utils';
import { AccountCircle, Groups } from '@mui/icons-material';
import TableActionGrid from '../components/TableActionGrid';

const styles = theme => ({
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
});

const GlobalUsers = props => {
  const [state, setState] = useState({
    checking: false,
  });
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [mode, setMode] = useState(0);
  const [type, setType] = useState(0);
  const context = useContext(CapabilityContext);

  const columns = [
    { label: 'Type', value: 'type' },
    { label: 'Display name', value: 'displayname' },
    { label: 'LDAP ID', value: 'ldapID' },
  ];

  useEffect(() => {
    const { fetchTableData } = props;
    const statuses = [];
    if(showDeactivated) statuses.push(1);
    if(mode === 0) {
      statuses.push(0, 4);
    }
    else if(mode === 4) statuses.push(4);
    else statuses.push(0);
    const filterProp = generatePropFilterString({
      displaytypeex: type,
    });
    fetchTableData({ sort: orderBy + "," + order, filterProp, status: statuses })
      .catch(err => err);
  }, [showDeactivated, mode, type]);

  const handleScroll = () => {
    const { Users, count } = props.users;
    const statuses = [];
    if(showDeactivated) statuses.push(1);
    if(mode === 0) {
      statuses.push(0, 4);
    }
    else if(mode === 4) statuses.push(4);
    else statuses.push(0);
    const filterProp = generatePropFilterString({
      displaytypeex: type,
    });
    props.handleScroll(Users, count, { filterProp, statuses });
  };

  const handleCheckClose = () => setState({ ...state, checking: false });

  const handleRedirect = obj => async (e) => {
    // If user is a group
    if(obj.properties?.displaytypeex === 1) {
      const userDetails = await props.fetchUserDetails(obj.domainID, obj.ID);
      handleEdit('/' + obj.domainID +'/groups/' + userDetails.mlist)(e);
    } else {
      handleEdit('/' + obj.domainID +'/users/' + obj.ID)(e);
    }
  }

  const handleSort = orderBy => () => {
    const statuses = [];
    if(showDeactivated) statuses.push(1);
    if(mode === 0) {
      statuses.push(0, 4);
    }
    else if(mode === 4) statuses.push(4);
    else statuses.push(0);
    const filterProp = generatePropFilterString({
      displaytypeex: type,
    });
    props.handleRequestSort(orderBy, { filterProp, status: statuses })();
  }

  const handleSelect = field => (e) => {
    if(field === "mode") setMode(e.target.value);
    else if(field === "type") setType(e.target.value);
  };

  const handleMatch = (e) => {
    const statuses = [];
    if(showDeactivated) statuses.push(1);
    if(mode === 0) {
      statuses.push(0, 4);
    }
    else if(mode === 4) statuses.push(4);
    else statuses.push(0);
    const filterProp = generatePropFilterString({
      displaytypeex: type,
    });
    props.handleMatch(e, { filterProp, status: statuses })
  };

  const { classes, t, users, tableState,
    handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
    clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
    handleDeleteSuccess, handleEdit } = props;
  const { loading, order, orderBy, match, snackbar, adding, deleting } = tableState;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  const { checking } = state;

  const userCounts = users.Users.reduce((prev, curr) => {
    const isGroup = curr.properties?.displaytypeex === 1;
    const shared = curr.status === 4;
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
          <MenuItem value={0}>Normal</MenuItem>
          <MenuItem value={7}>Room</MenuItem>
          <MenuItem value={8}>Equipment</MenuItem>
        </TextField>
        <FormControlLabel
          control={<Checkbox
            checked={showDeactivated}
            onChange={() => setShowDeactivated(!showDeactivated)}
          />}
          label="Show deactivated"
        />
      </div>
      <Typography className={classes.count} color="textPrimary">
        {t("showingUser", { count: users.Users.length })}
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
                    align="left" 
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
              {users.Users.map((obj, idx) => {
                const properties = obj.properties || {};
                return (
                  <TableRow key={idx} hover onClick={handleRedirect(obj)}>
                    <TableCell>
                      <div className={classes.flexRow}>
                        {properties.displaytypeex === 1 ?
                          <Groups className={classes.icon} fontSize='small'/> :
                          <AccountCircle className={classes.icon} fontSize='small'/>
                        }
                        {obj.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      {t(getUserTypeString(properties.displaytypeex))}
                      {obj.status === 4 && ` (${t("Shared")})`}
                      {obj.status === 1 && ` (${t("Deactivated")})`}
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
            {users.Users.map((obj, idx) => 
              <ListItemButton
                key={idx}
                onClick={handleEdit('/' + obj.domainID + '/users/' +  obj.ID)}
                divider
              >
                <ListItemIcon>
                  {obj.properties?.displaytypeex === 1 ?
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
        {(users.Users.length < users.count) && <Grid2 container justifyContent="center">
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
      <CheckLdapDialog
        open={checking}
        onClose={handleCheckClose}
        onError={handleDeleteError}
      />
    </TableViewContainer>
  );
}

GlobalUsers.propTypes = {
  users: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  check: PropTypes.func.isRequired,
  sync: PropTypes.func.isRequired,
  fetchUserDetails: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return { users: state.users };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async params => {
      await dispatch(fetchAllUsers({ ...params })).catch(error => Promise.reject(error));
    },
    fetchUserDetails: async (domainID, userID) => await dispatch(fetchUserData(domainID, userID))
      .catch(msg => Promise.reject(msg)),
    delete: async (domainID, id) => {
      await dispatch(deleteUserData(domainID, id)).catch(error => Promise.reject(error));
    },
    check: async params => await dispatch(checkLdapUsers(params))
      .catch(error => Promise.reject(error)),
    sync: async (params, domainID) => await dispatch(syncLdapUsers(params, domainID))
      .catch(error => Promise.reject(error)),
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(GlobalUsers, { orderBy: 'username', suppressFetch: true });
