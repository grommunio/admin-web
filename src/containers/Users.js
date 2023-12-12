// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid, TableSortLabel,
  CircularProgress, Tooltip, Hidden, List, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import { fetchUsersData, deleteUserData, checkLdapUsers } from '../actions/users';
import { syncLdapUsers } from '../actions/ldap';
import AddUser from '../components/Dialogs/AddUser';
import DeleteUser from '../components/Dialogs/DeleteUser';
import CheckLdapDialog from '../components/Dialogs/CheckLdapDialog';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import TaskCreated from '../components/Dialogs/TaskCreated';
import withStyledReduxTable from '../components/withTable';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
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

class Users extends Component {

  state = {
    snackbar: '',
    checking: false,
    taskMessage: '',
    taskID: null,
  }

  handleScroll = () => {
    const { Users, count, loading } = this.props.users;
    this.props.handleScroll(Users, count, loading);
  };

  columns = [
    { label: 'Type', value: 'type' },
    { label: 'Display name', value: 'displayname' },
    { label: 'LDAP ID', value: 'ldapID' },
    { label: 'Storage quota limit', value: 'storagequotalimit' },
  ]

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  getMaxSizeFormatting(size) {
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

  handleUserSync = importUsers => () => {
    const { sync, domain, fetchTableData } = this.props;
    sync({ import: importUsers }, domain.ID)
      .then(response => {
        if(response?.taskID) {
          // Background task was created -> Show task dialog
          this.setState({
            taskMessage: response.message || 'Task created',
            loading: false,
            taskID: response.taskID,
          });
        } else {
          // No task created -> Reload table data
          const { tableState } = this.props;
          const { order, orderBy, match } = tableState;
          this.setState({ snackbar: 'Success!' });
          fetchTableData(domain.ID, { match: match || undefined, sort: orderBy + ',' + order })
            .catch(msg => this.setState({ snackbar: msg }));
        }
      })
      .catch(msg => this.setState({ snackbar: msg }));
  }

  handleTaskClose = () => this.setState({
    taskMessage: "",
    taskID: null,
  })

  checkUsers = () => {
    this.props.check({ domain: this.props.domain.ID })
      .catch(msg => this.setState({ snackbar: msg }));
    this.setState({ checking: true });
  }

  handleCheckClose = () => this.setState({ checking: false });

  // Generates quota bar chart
  calculateGraph(obj) {
    const { classes } = this.props;
    const { prohibitsendquota, messagesizeextended } = obj;
    const spaceUsed = ((messagesizeextended / (prohibitsendquota * 1024)) * 100).toFixed(0) + '%';
    return <div className={classes.barBackground}>
      <div style={{
        width: spaceUsed,
        height: 20,
        background: 'linear-gradient(150deg, #56CCF2, #2F80ED)',
        display: 'flex',
        justifyContent: 'center',
      }}></div>
    </div>;
  }

  handleSnackbarClose = () => {
    this.setState({ snackbar: '' });
    this.props.clearSnackbar();
  }

  render() {
    const { classes, t, users, domain, tableState, handleMatch, handleRequestSort,
      handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
      handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const { loading, order, orderBy, match, snackbar, adding, deleting } = tableState;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { checking, taskMessage, taskID } = this.state;
    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Users")}
        subtitle={t('users_sub')}
        href="https://docs.grommunio.com/admin/administration.html#users"
        snackbar={snackbar || this.state.snackbar}
        onSnackbarClose={this.handleSnackbarClose}
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
            onClick={this.handleNavigation(domain.ID + '/ldap')}
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
              onClick={this.handleUserSync(false)}
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
              onClick={this.handleUserSync(true)}
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
              onClick={this.checkUsers}
              disabled={!writable}
            >
              {t('Check LDAP')}
            </Button>
          </Tooltip>
        </TableActionGrid>
        <Typography className={classes.count} color="textPrimary">
          {t("showingUser", { count: users.Users.length })}
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
                      color="primary"
                      sx={{
                        color: 'text.primary',
                      }}
                    >
                      {t('Username')}
                    </TableSortLabel>
                  </TableCell>
                  {this.columns.map(column =>
                    <TableCell key={column.value}>
                      {t(column.label)}
                    </TableCell>
                  )}
                  <TableCell padding="checkbox"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.Users.filter(u => u.status !== 5 /* Remove contacts */).map((obj, idx) => {
                  const properties = obj.properties || {};
                  return (
                    <TableRow
                      key={idx}
                      hover
                      onClick={handleEdit('/' + domain.ID + '/users/' +  obj.ID)} /* TODO: Redundant */
                    >
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
                        {obj.status === 4 && `(${t("Shared")})`}
                      </TableCell>
                      <TableCell>{properties.displayname}</TableCell>
                      <TableCell>{obj.ldapID || ''}</TableCell>
                      <TableCell>{this.getMaxSizeFormatting(properties.storagequotalimit)}</TableCell>
                      <TableCell align="right">
                        {writable && <IconButton onClick={handleDelete(obj)} size="large">
                          <Delete color="error"/>
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
              {users.Users.filter(u => u.status !== 5 /* Remove contacts */).map((obj, idx) => 
                <ListItemButton
                  key={idx}
                  onClick={handleEdit('/' + domain.ID + '/users/' + obj.ID)}
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
          onClose={this.handleCheckClose}
          onError={handleDeleteError}
        />
        <TaskCreated
          message={taskMessage}
          taskID={taskID}
          onClose={this.handleTaskClose}
        />
      </TableViewContainer>
    );
  }
}

Users.contextType = CapabilityContext;
Users.propTypes = {
  users: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  check: PropTypes.func.isRequired,
  sync: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return { users: state.users };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async (domainID, params) => {
      await dispatch(fetchUsersData(domainID, {...params, mlist: ""})).catch(error => Promise.reject(error));
    },
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
  mapStateToProps, mapDispatchToProps, styles)(Users, { orderBy: 'username'});
