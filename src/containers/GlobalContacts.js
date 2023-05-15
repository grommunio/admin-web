// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid,
  CircularProgress, 
  Hidden,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import { deleteUserData, fetchAllContacts } from '../actions/users';
import DeleteUser from '../components/Dialogs/DeleteUser';
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import withStyledReduxTable from '../components/withTable';
import SearchTextfield from '../components/SearchTextfield';
import AddGlobalContact from '../components/Dialogs/AddGlobalContact';
import { ContactMail } from '@mui/icons-material';
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

class GlobalContacts extends Component {

  state = {
    addingContact: false,
  }

  columns = [
    { label: 'Display name', value: 'displayname' },
    { label: 'E-Mail address', value: 'smtpaddress' },
  ]

  handleScroll = () => {
    const { Users, count, loading } = this.props.users;
    this.props.handleScroll(Users, count, loading);
  };

  handleAddContact = () => this.setState({ addingContact: true });

  handleContactClose = () => this.setState({ addingContact: false });

  handleContactSuccess = () => this.setState({ addingContact: false });

  handleContactError = (error) => this.setState({ snackbar: error });

  render() {
    const { classes, t, users, tableState, handleMatch,
      clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
      handleDeleteSuccess, handleEdit } = this.props;
    const { loading, match, snackbar, deleting } = tableState;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    const { addingContact } = this.state;
    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
        headline={t("Contacts")}
        subtitle={t("globalcontacts_sub")}
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
            onClick={this.handleAddContact}
            disabled={!writable}
          >
            {t('New contact')}
          </Button>
        </TableActionGrid>
        <Typography className={classes.count} color="textPrimary">
          {t("showingUser", { count: users.Users.length })}
        </Typography>
        <Paper className={classes.tablePaper} elevation={1}>
          <Hidden lgDown>
            <Table size="small">
              <TableHead>
                <TableRow>
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
                    <TableRow
                      key={idx}
                      hover
                      onClick={handleEdit('/' + obj.domainID + '/contacts/' +  obj.ID)}
                    >
                      <TableCell>
                        <div className={classes.flexRow}>
                          <ContactMail className={classes.icon} fontSize='small'/>
                          {properties.displayname || ""}
                        </div>
                      </TableCell>
                      <TableCell>{properties.smtpaddress || ""}</TableCell>
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
              {users.Users.map((obj, idx) => 
                <ListItemButton
                  key={idx}
                  onClick={handleEdit('/' + obj.domainID + '/users/' +  obj.ID)}
                  divider
                >
                  <ListItemIcon>
                    <ContactMail className={classes.icon} fontSize='small'/>
                  </ListItemIcon>
                  <ListItemText
                    primary={obj.properties?.displayname || ''}
                    secondary={obj.properties?.smtpaddress || ''}
                  />
                </ListItemButton>
              )}
            </List>
          </Hidden>
          {(users.Users.length < users.count) && <Grid container justifyContent="center">
            <CircularProgress color="primary" className={classes.circularProgress}/>
          </Grid>}
        </Paper>
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
      </TableViewContainer>
    );
  }
}

GlobalContacts.contextType = CapabilityContext;
GlobalContacts.propTypes = {
  users: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return { users: state.users };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async params => {
      await dispatch(fetchAllContacts(params)).catch(error => Promise.reject(error));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteUserData(domainID, id)).catch(error => Promise.reject(error));
    },
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(GlobalContacts, { orderBy: 'username'});
