// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useState } from 'react';
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
import { CapabilityContext } from '../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import withStyledReduxTable from '../components/withTable';
import SearchTextfield from '../components/SearchTextfield';
import AddGlobalContact from '../components/Dialogs/AddGlobalContact';
import { ContactMail } from '@mui/icons-material';
import TableActionGrid from '../components/TableActionGrid';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';

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

const GlobalContacts = props => {
  const [addingContact, setAddingContact] = useState(false);
  const context = useContext(CapabilityContext);
  const columns = [
    { label: 'Display name', value: 'displayname' },
    { label: 'E-Mail address', value: 'smtpaddress' },
  ]

  const handleScroll = () => {
    const { Users, count, loading } = props.users;
    props.handleScroll(Users, count, loading);
  };

  const handleAddContact = () => setAddingContact(true);

  const handleContactClose = () => setAddingContact(false);

  const handleContactSuccess = () => setAddingContact(false);

  const { classes, t, users, tableState, handleMatch,
    clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
    handleDeleteSuccess, handleEdit } = props;
  const { loading, match, snackbar, deleting } = tableState;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);
  return (
    <TableViewContainer
      handleScroll={handleScroll}
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
          onClick={handleAddContact}
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
        onSuccess={handleContactSuccess}
        onError={handleDeleteError}
        onClose={handleContactClose}
      />
      <DomainDataDelete
        open={!!deleting}
        onSuccess={handleDeleteSuccess}
        onClose={handleDeleteClose}
        onError={handleDeleteError}
        domainID={deleting.domainID || -1}
        item={deleting.properties?.displayname || deleting.properties?.smtpaddress || deleting.username || ""}
        delete={props.delete}
        id={deleting.ID}
      />
    </TableViewContainer>
  );
}

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
