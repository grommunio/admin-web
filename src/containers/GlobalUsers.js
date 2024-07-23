// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid, TableSortLabel,
  CircularProgress, 
  Hidden,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText} from '@mui/material';
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
import { getUserTypeString } from '../utils';
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
});

const GlobalUsers = props => {
  const [state, setState] = useState({
    checking: false,
  });
  const context = useContext(CapabilityContext);

  const columns = [
    { label: 'Type', value: 'type' },
    { label: 'Display name', value: 'displayname' },
    { label: 'LDAP ID', value: 'ldapID' },
  ]

  const handleScroll = () => {
    const { Users, count } = props.users;
    props.handleScroll(Users, count);
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

  const { classes, t, users, tableState, handleMatch, handleRequestSort,
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
      <Typography className={classes.count} color="textPrimary">
        {t("showingUser", { count: users.Users.length })}
        {` (${userCounts.normal} ${t("normal")}, ${userCounts.group} ${t("groups")}, ${userCounts.shared} ${t("shared")})`}
      </Typography>
      <Paper className={classes.tablePaper} elevation={1}>
        <Hidden lgDown>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'username'}
                    align="left" 
                    direction={orderBy === 'username' ? order : 'asc'}
                    onClick={handleRequestSort('username')}
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
          </Table>
        </Hidden>
        <Hidden lgUp>
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
          </List>
        </Hidden>
        {(users.Users.length < users.count) && <Grid container justifyContent="center">
          <CircularProgress color="primary" className={classes.circularProgress}/>
        </Grid>}
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
      await dispatch(fetchAllUsers({ status: '0,1,4', ...params })).catch(error => Promise.reject(error));
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
  mapStateToProps, mapDispatchToProps, styles)(GlobalUsers, { orderBy: 'username'});
