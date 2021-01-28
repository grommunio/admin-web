// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import debounce from 'debounce';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid, TableSortLabel,
  CircularProgress, TextField, InputAdornment } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Search from '@material-ui/icons/Search';
import Delete from '@material-ui/icons/Delete';
import { connect } from 'react-redux';
import { fetchUsersData, deleteUserData, checkLdapUsers } from '../actions/users';
import { syncLdapUsers } from '../actions/ldap';
import TopBar from '../components/TopBar';
import AddUser from '../components/Dialogs/AddUser';
import DeleteUser from '../components/Dialogs/DeleteUser';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';
import CheckLdapDialog from '../components/Dialogs/CheckLdapDialog';
import Feedback from '../components/Feedback';

const styles = theme => ({
  root: {
    flex: 1,
    overflow: 'auto',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
  },
  tablePaper: {
    margin: theme.spacing(3, 2),
    borderRadius: 6,
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  pageTitleSecondary: {
    color: '#aaa',
  },
  homeIcon: {
    color: blue[500],
    position: 'relative',
    top: 4,
    left: 4,
    cursor: 'pointer',
  },
  circularProgress: {
    margin: theme.spacing(1, 0),
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
  }

  columns = [
    { label: 'Username', value: 'username' },
    { label: 'Display name', value: 'displayname' },
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
      if(!users.loading) this.fetchUsers({
        sort: orderBy + ',' + order,
        offset,
        match: match || undefined,
      });
      this.setState({
        offset: offset + 50,
      });
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

  handleAddingSuccess = () => this.setState({ snackbar: 'Success!' });

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
      return size / 1073741824 + ' TiB';
    } else if (size % 1048576 === 0) {
      return size / 1048576 + ' GiB';
    } else if (size % 1024 === 0) {
      return size / 1024 + ' MiB';
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

  handleUserSync = () => {
    this.props.sync()
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(msg => this.setState({ snackbar: msg }));
  }

  checkUsers = () => {
    this.props.check({});
    this.setState({ checking: true });
  }

  handleCheckClose = () => this.setState({ checking: false });

  render() {
    const { classes, t, users, domain } = this.props;
    const { snackbar, adding, deleting, order, orderBy, match, checking } = this.state;

    return (
      <div
        className={classes.root}
        onScroll={debounce(this.handleScroll, 100)}
        id="scrollDiv"
      >
        <TopBar title={domain.domainname}/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Users")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <Grid container alignItems="flex-end" className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleAdd}
              className={classes.newButton}
            >
              {t('New user')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleNavigation(domain.ID + '/ldap')}
              className={classes.newButton}
            >
              {t('Search in LDAP')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleUserSync}
              className={classes.newButton}
            >
              {t('Sync LDAP users')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.checkUsers}
            >
              {t('Check LDAP users')}
            </Button>
            <div className={classes.actions}>
              <TextField
                value={match}
                onChange={this.handleMatch}
                label={t("Search")}
                variant="outlined"
                className={classes.textfield}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                color="primary"
              />
            </div>
          </Grid>
          <Paper className={classes.tablePaper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {this.columns.map(column =>
                    <TableCell key={column.value}>
                      <TableSortLabel
                        active={orderBy === column.value}
                        align="left" 
                        direction={orderBy === column.value ? order : 'asc'}
                        onClick={this.handleRequestSort(column.value)}
                      >
                        {t(column.label)}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.Users.map((obj, idx) => {
                  const properties = obj.properties || {};
                  return <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                    <TableCell>{obj.username}</TableCell>
                    <TableCell>{properties.displayname}</TableCell>
                    <TableCell>{obj.ldapID || ''}</TableCell>
                    <TableCell>{this.getMaxSizeFormatting(properties.storagequotalimit)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={this.handleDelete(obj)}>
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>;
                })}
              </TableBody>
            </Table>
            {(users.Users.length < users.count) && <Grid container justify="center">
              <CircularProgress color="primary" className={classes.circularProgress}/>
            </Grid>}
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: '' })}
          />
        </div>
        <AddUser
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          domain={this.props.domain}
          onClose={this.handleAddingClose}
        />
        <DeleteUser
          open={!!deleting}
          onSuccess={this.handleDeleteSuccess}
          onClose={this.handleDeleteClose}
          onError={this.handleDeleteError}
          domainID={this.props.domain.ID}
          user={deleting}
        />
        <CheckLdapDialog
          open={checking}
          onClose={this.handleCheckClose}
          onError={this.handleDeleteError}
        />
      </div>
    );
  }
}

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
    sync: async () => await dispatch(syncLdapUsers())
      .catch(error => Promise.reject(error)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Users)));
