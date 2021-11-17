// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import debounce from 'debounce';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid, TableSortLabel,
  CircularProgress, TextField, InputAdornment } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Search from '@mui/icons-material/Search';
import Delete from '@mui/icons-material/Delete';
import { connect } from 'react-redux';
import { deleteUserData, checkLdapUsers, fetchAllUsers } from '../actions/users';
import { syncLdapUsers } from '../actions/ldap';
import DeleteUser from '../components/Dialogs/DeleteUser';
import CheckLdapDialog from '../components/Dialogs/CheckLdapDialog';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import AddGlobalUser from '../components/Dialogs/AddGlobalUser';

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

class GlobalUsers extends Component {

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
    { label: 'LDAP ID', value: 'ldapID' },
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
    this.fetchUsers({ sort: 'username,asc', level: 1 });
  }

  fetchUsers(params) {
    const { fetch } = this.props;
    fetch(params)
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
    this.props.history.push('/' + user.domainID + '/users/' + user.ID, { ...user });
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleRequestSort = orderBy => () => {
    const { fetch } = this.props;
    const { order: stateOrder, orderBy: stateOrderBy, match } = this.state;
    const order = (stateOrderBy === orderBy && stateOrder === "asc") ? "desc" : "asc";
    
    fetch({
      sort: orderBy + ',' + order,
      match: match || undefined,
    }).catch(msg => this.setState({ snackbar: msg }));

    this.setState({
      order: order,
      orderBy,
      offset: 0,
    });
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

  render() {
    const { classes, t, users } = this.props;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    const { snackbar, adding, deleting, order, orderBy, match, checking } = this.state;
    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Users")}
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
                return (
                  <TableRow key={idx} hover onClick={this.handleEdit(obj)}>
                    <TableCell>{obj.username}</TableCell>
                    <TableCell>{obj.ldapID || ''}</TableCell>
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
        <AddGlobalUser
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          onClose={this.handleAddingClose}
        />
        <DeleteUser
          open={!!deleting}
          onSuccess={this.handleDeleteSuccess}
          onClose={this.handleDeleteClose}
          onError={this.handleDeleteError}
          user={deleting}
          domainID={deleting.domainID || -1}
        />
        <CheckLdapDialog
          open={checking}
          onClose={this.handleCheckClose}
          onError={this.handleDeleteError}
        />
      </TableViewContainer>
    );
  }
}

GlobalUsers.contextType = CapabilityContext;
GlobalUsers.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired,
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
    fetch: async params => {
      await dispatch(fetchAllUsers(params)).catch(error => Promise.reject(error));
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
  withTranslation()(withStyles(styles)(GlobalUsers)));
