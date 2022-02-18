// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import debounce from 'debounce';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid, TableSortLabel,
  CircularProgress, TextField, InputAdornment, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Search from '@mui/icons-material/Search';
import Delete from '@mui/icons-material/Delete';
import { connect } from 'react-redux';
import { fetchUsersData, deleteUserData, checkLdapUsers } from '../actions/users';
import { syncLdapUsers } from '../actions/ldap';
import AddUser from '../components/Dialogs/AddUser';
import DeleteUser from '../components/Dialogs/DeleteUser';
import CheckLdapDialog from '../components/Dialogs/CheckLdapDialog';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import TaskCreated from '../components/Dialogs/TaskCreated';

const styles = theme => ({
  tablePaper: {
    margin: theme.spacing(3, 2, 3, 2),
    borderRadius: 6,
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  textfield: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
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
});

class Users extends Component {

  state = {
    snackbar: null,
    adding: false,
    deleting: false,
    checking: false,
    order: 'asc',
    orderBy: 'username',
    offset: 50,
    match: '',
    taskMessage: '',
    taskID: null,
  }

  columns = [
    { label: 'Display name', value: 'displayname' },
    { label: 'Mode', value: 'status' },
    { label: 'Type', value: 'type' },
    { label: 'LDAP ID', value: 'ldapID' },
    { label: 'Storage quota limit', value: 'storagequotalimit' },
  ]

  handleScroll = () => {
    const { users } = this.props;
    if((users.Users.length >= users.count)) return;
    if (
      Math.floor(document.getElementById('scrollDiv').scrollHeight - document.getElementById('scrollDiv').scrollTop)
      <= document.getElementById('scrollDiv').offsetHeight + 20
    ) {
      const { orderBy, order, offset, match } = this.state;
      if(!users.loading) {
        this.fetchUsers({
          sort: orderBy + ',' + order,
          offset,
          match: match || undefined,
        });
        this.setState({
          offset: offset + 50,
        });
      }
    }
  }

  componentDidMount() {
    this.fetchUsers({ sort: 'username,asc' });
  }

  fetchUsers(params) {
    const { fetch, domain } = this.props;
    fetch(domain.ID, params)
      .catch(msg => this.setState({ snackbar: msg }));
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ snackbar: 'Success!', adding: false });

  handleAddingClose = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleDelete = user => event => {
    event.stopPropagation();
    this.setState({ deleting: user });
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  handleEdit = user => () => {
    this.props.history.push('/' + this.props.domain.ID + '/users/' + user.ID, { ...user });
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleRequestSort = orderBy => () => {
    const { fetch, domain } = this.props;
    const { order: stateOrder, orderBy: stateOrderBy, match } = this.state;
    const order = (stateOrderBy === orderBy && stateOrder === "asc") ? "desc" : "asc";
    
    fetch(domain.ID, {
      sort: orderBy + ',' + order,
      match: match || undefined,
    }).catch(msg => this.setState({ snackbar: msg }));

    this.setState({
      order: order,
      orderBy,
      offset: 0,
    });
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

  handleMatch = e => {
    const { value } = e.target;
    this.debouceFetch(value);
    this.setState({ match: value });
  }

  debouceFetch = debounce(value => {
    const { order, orderBy } = this.state;
    this.fetchUsers({ match: value || undefined, sort: orderBy + ',' + order });
  }, 200)

  handleUserSync = importUsers => () => {
    const { sync, domain } = this.props;
    sync({ import: importUsers }, domain.ID)
      .then(response => {
        if(response?.taskID) {
          this.setState({
            taskMessage: response.message || 'Task created',
            loading: false,
            taskID: response.taskID,
          });
        } else {
          const { order, orderBy, match } = this.state;
          this.setState({ snackbar: 'Success!' });
          this.fetchUsers({ match: match || undefined, sort: orderBy + ',' + order });
        }
      })
      .catch(msg => this.setState({ snackbar: msg }));
  }

  handleTaskClose = () => this.setState({
    taskMessage: "",
    taskID: null,
  })

  checkUsers = () => {
    this.props.check({})
      .catch(msg => this.setState({ snackbar: msg }));
    this.setState({ checking: true });
  }

  handleCheckClose = () => this.setState({ checking: false });

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

  getStatus(status) {
    return status === 4 ? 'Shared' : 'Normal';
  }

  getType(type) {
    switch(type) {
      case 0: return "User";
      case 1: return "Mail list";
      case 7: return "Room";
      case 8: return "Equipment";
      default: return "Unknown";
    }
  }

  render() {
    const { classes, t, users, domain } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { snackbar, adding, deleting, order, orderBy, match, checking,
      taskMessage, taskID } = this.state;
    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Users")}
        subtitle={t('users_sub')}
        href="https://docs.grommunio.com/admin/administration.html#users"
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleAdd}
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
          <Tooltip placement="top" title="Synchronize imported users for this domain">
            <Button
              variant="contained"
              color="primary"
              className={classes.newButton}
              onClick={this.handleUserSync(false)}
              disabled={!writable}
            >
              {t('Sync LDAP users')}
            </Button>
          </Tooltip>
          <Tooltip
            placement="top"
            title="Import new users from LDAP for this domain and synchronize previously imported ones"
          >
            <Button
              variant="contained"
              color="primary"
              className={classes.newButton}
              onClick={this.handleUserSync(true)}
              disabled={!writable}
            >
              {t('Import LDAP users')}
            </Button>
          </Tooltip>
          <Tooltip
            placement="top"
            title="Check status of imported users of this domain"
          >
            <Button
              variant="contained"
              color="primary"
              onClick={this.checkUsers}
              disabled={!writable}
            >
              {t('Check LDAP users')}
            </Button>
          </Tooltip>
          <div className={classes.actions}>
            <TextField
              value={match}
              onChange={this.handleMatch}
              placeholder={t("Search")}
              variant="outlined"
              className={classes.textfield}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="secondary" />
                  </InputAdornment>
                ),
              }}
              color="primary"
            />
          </div>
        </Grid>
        <Typography className={classes.count} color="textPrimary">
          {t("showingUser", { count: users.Users.length })}
        </Typography>
        <Paper className={classes.tablePaper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'username'}
                    align="left" 
                    direction={orderBy === 'username' ? order : 'asc'}
                    onClick={this.handleRequestSort('username')}
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
              {users.Users.map((obj, idx) => {
                const properties = obj.properties || {};
                return (
                  <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                    <TableCell>{obj.username}</TableCell>
                    <TableCell>{properties.displayname}</TableCell>
                    <TableCell>{this.getStatus(obj.status)}</TableCell>
                    <TableCell>{this.getType(properties.displaytypeex)}</TableCell>
                    <TableCell>{obj.ldapID || ''}</TableCell>
                    <TableCell>{this.getMaxSizeFormatting(properties.storagequotalimit)}</TableCell>
                    <TableCell align="right">
                      {writable && <IconButton onClick={this.handleDelete(obj)} size="large">
                        <Delete color="error"/>
                      </IconButton>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {(users.Users.length < users.count) && <Grid container justifyContent="center">
            <CircularProgress color="primary" className={classes.circularProgress}/>
          </Grid>}
        </Paper>
        <AddUser
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          domain={domain}
          onClose={this.handleAddingClose}
        />
        <DeleteUser
          open={!!deleting}
          onSuccess={this.handleDeleteSuccess}
          onClose={this.handleDeleteClose}
          onError={this.handleDeleteError}
          domainID={domain.ID}
          user={deleting}
        />
        <CheckLdapDialog
          open={checking}
          onClose={this.handleCheckClose}
          onError={this.handleDeleteError}
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
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
  check: PropTypes.func.isRequired,
  sync: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { users: state.users };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, params) => {
      await dispatch(fetchUsersData(domainID, params)).catch(error => Promise.reject(error));
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

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Users)));
