// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid, TableSortLabel,
  CircularProgress } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import { deleteUserData, checkLdapUsers, fetchAllUsers } from '../actions/users';
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
import AddGlobalContact from '../components/Dialogs/AddGlobalContact';
import { getUserStatusString, getUserTypeString } from '../utils';
import { AccountCircle, ContactMail } from '@mui/icons-material';

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
  flexRow: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
});

class GlobalUsers extends Component {

  state = {
    checking: false,
    addingContact: false,
  }

  columns = [
    { label: 'Display name', value: 'displayname' },
    { label: 'Mode', value: 'status' },
    { label: 'Type', value: 'type' },
    { label: 'LDAP ID', value: 'ldapID' },
  ]

  handleScroll = () => {
    const { Users, count, loading } = this.props.users;
    this.props.handleScroll(Users, count, loading);
  };

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

  handleAddContact = () => this.setState({ addingContact: true });

  handleContactClose = () => this.setState({ addingContact: false });

  handleContactSuccess = () => this.setState({ addingContact: false });

  handleContactError = (error) => this.setState({ snackbar: error });

  render() {
    const { classes, t, users, tableState, handleMatch, handleRequestSort,
      handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
      clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const { loading, order, orderBy, match, snackbar, adding, deleting } = tableState;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    const { checking, addingContact } = this.state;
    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Users")}
        subtitle={t("globalusers_sub")}
        href="https://docs.grommunio.com/admin/administration.html#users"
        snackbar={snackbar}
        onSnackbarClose={clearSnackbar}
        loading={loading}
      > 
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
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
            onClick={this.handleAddContact}
            className={classes.newButton}
            disabled={!writable}
          >
            {t('New contact')}
          </Button>
          <div className={classes.actions}>
            <SearchTextfield
              value={match}
              onChange={handleMatch}
              placeholder={t("Search users")}
              className={classes.textfield}
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
                    onClick={handleRequestSort('username')}
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
                  <TableRow key={idx} hover onClick={handleEdit('/' + obj.domainID + (obj.status === 5 ? '/contacts/' : '/users/') + obj.ID)}>
                    <TableCell>
                      <div className={classes.flexRow}>
                        {obj.status === 5 ?
                          <ContactMail className={classes.icon} fontSize='small'/> :
                          <AccountCircle className={classes.icon} fontSize='small'/>
                        }
                        {obj.username}
                      </div>
                    </TableCell>
                    <TableCell>{properties.displayname}</TableCell>
                    <TableCell>{t(getUserStatusString(obj.status))}</TableCell>
                    <TableCell>{t(getUserTypeString(properties.displaytypeex))}</TableCell>
                    <TableCell>{obj.ldapID || ''}</TableCell>
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
        <AddGlobalContact
          open={addingContact}
          onSuccess={this.handleContactSuccess}
          onError={handleDeleteError}
          onClose={this.handleContactClose}
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
          onClose={this.handleCheckClose}
          onError={handleDeleteError}
        />
      </TableViewContainer>
    );
  }
}

GlobalUsers.contextType = CapabilityContext;
GlobalUsers.propTypes = {
  users: PropTypes.object.isRequired,
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
    fetchTableData: async params => {
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

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(GlobalUsers, { orderBy: 'username'});
