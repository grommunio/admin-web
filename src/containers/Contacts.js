// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid,
  CircularProgress, Hidden, List, ListItemButton, ListItemText, ListItemIcon, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import { checkLdapUsers, deleteUserData, fetchContactsData } from '../actions/users';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import TaskCreated from '../components/Dialogs/TaskCreated';
import withStyledReduxTable from '../components/withTable';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import SearchTextfield from '../components/SearchTextfield';
import AddContact from '../components/Dialogs/AddContact';
import { ContactMail } from '@mui/icons-material';
import TableActionGrid from '../components/TableActionGrid';
import { syncLdapUsers } from '../actions/ldap';
import CheckLdapDialog from '../components/Dialogs/CheckLdapDialog';
import { useNavigate } from 'react-router';

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
  flexRow: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
});

const Contacts = props => {
  const context = useContext(CapabilityContext);
  const [state, setState] = useState({
    snackbar: '',
    checking: false,
    taskMessage: '',
    taskID: null,
    addingContact: false,
  });
  const navigate = useNavigate();

  const handleScroll = () => {
    const { Users, count } = props.users;
    props.handleScroll(Users, count);
  };

  const columns = [
    { label: 'Display name', value: 'displayname' },
    { label: 'E-Mail address', value: 'smtpaddress' },
  ]

  const handleNavigation = path => event => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const handleTaskClose = () => setState({
    ...state,
    taskMessage: "",
    taskID: null,
  })

  const handleSnackbarClose = () => {
    setState({ ...state, snackbar: '' });
    props.clearSnackbar();
  }

  /* This function is not actually doing what it pretends to do.
  *  There is no endpoint to explicitely sync LDAP groups.
  *  However, LDAP groups are just users, so syncing users has the desired effect.
  */
  const handleContactsSync = importUsers => () => {
    const { sync, domain, fetchTableData } = props;
    sync({ import: importUsers }, domain.ID)
      .then(response => {
        if(response?.taskID) {
          // Background task was created -> Show task dialog
          setState({
            ...state,
            taskMessage: response.message || 'Task created',
            loading: false,
            taskID: response.taskID,
          });
        } else {
          // No task created -> Reload table data
          const { tableState } = props;
          const { order, orderBy, match } = tableState;
          setState({ ...state, snackbar: 'Success!' });
          fetchTableData(domain.ID, { match: match || undefined, sort: orderBy + ',' + order })
            .catch(msg => setState({ ...state, snackbar: msg }));
        }
      })
      .catch(msg => setState({ ...state, snackbar: msg }));
  }

  const checkUsers = async () => {
    await props.check({ domain: props.domain.ID })
      .catch(msg => setState({ ...state, snackbar: msg }));
    setState({ ...state, checking: true });
  }

  const handleAddContact = () => setState({ ...state, addingContact: true });

  const handleContactClose = () => setState({ ...state, addingContact: false });

  const handleContactSuccess = () => setState({ ...state, addingContact: false, snackbar: 'Success!' });

  const handleContactError = (error) => setState({ ...state, snackbar: error });

  const handleCheckClose = () => setState({ ...state, checking: false });

  const { classes, t, users, domain, tableState, handleMatch,
    handleDelete, handleDeleteClose, handleDeleteError,
    handleDeleteSuccess, handleEdit } = props;
  const { loading, match, snackbar, deleting } = tableState;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  const { addingContact, checking, taskMessage, taskID } = state;
  return (
    <TableViewContainer
      handleScroll={handleScroll}
      headline={t("Contacts")}
      subtitle={t('contacts_sub')}
      href="https://docs.grommunio.com/admin/administration.html#users"
      snackbar={snackbar || state.snackbar}
      onSnackbarClose={handleSnackbarClose}
      loading={loading}
    >
      <TableActionGrid
        tf={<SearchTextfield
          value={match}
          onChange={handleMatch}
          placeholder={t("Search contacts")}
        />}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddContact}
          className={classes.newButton}
          disabled={!writable}
        >
          {t('New contact')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNavigation(domain.ID + '/ldap')}
          className={classes.newButton}
          disabled={!writable}
        >
          {t('Search in LDAP')}
        </Button>
        <Tooltip placement="top" title={t("Synchronize LDAP for this domain")}>
          <Button
            variant="contained"
            color="primary"
            className={classes.newButton}
            onClick={handleContactsSync(false)}
            disabled={!writable}
          >
            {t('Sync LDAP')}
          </Button>
        </Tooltip>
        <Tooltip
          placement="top"
          title={t("Import new contacts from LDAP for this domain") + " " + t("and synchronize previously imported ones")}
        >
          <Button
            variant="contained"
            color="primary"
            className={classes.newButton}
            onClick={handleContactsSync(true)}
            disabled={!writable}
          >
            {t('Import LDAP')}
          </Button>
        </Tooltip>
        <Tooltip
          placement="top"
          title={t("Check status of imported contacts of this domain")}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={checkUsers}
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
                    onClick={handleEdit('/' + domain.ID + '/contacts/' +  obj.ID)}
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
                        <Delete color="error" fontSize="small"/>
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
                onClick={handleEdit('/' + domain.ID + '/contacts/' +  obj.ID)}
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
      <AddContact
        domain={domain}
        open={addingContact}
        onSuccess={handleContactSuccess}
        onError={handleContactError}
        onClose={handleContactClose}
      />
      <DomainDataDelete
        open={!!deleting}
        onSuccess={handleDeleteSuccess}
        onClose={handleDeleteClose}
        onError={handleDeleteError}
        item={deleting.properties?.displayname || deleting.properties?.smtpaddress || deleting.username || ""}
        delete={props.delete}
        id={deleting.ID}
        domainID={domain.ID}
      />
      <TaskCreated
        message={taskMessage}
        taskID={taskID}
        onClose={handleTaskClose}
      />
      <CheckLdapDialog
        open={checking}
        onClose={handleCheckClose}
        onError={handleDeleteError}
      />
    </TableViewContainer>
  );
}

Contacts.propTypes = {
  users: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  sync: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return { users: state.users };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async (domainID, params) => {
      await dispatch(fetchContactsData(domainID, params))
        .catch(error => Promise.reject(error));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteUserData(domainID, id)).catch(error => Promise.reject(error));
    },
    sync: async (params, domainID) => await dispatch(syncLdapUsers(params, domainID))
      .catch(error => Promise.reject(error)),
    check: async params => await dispatch(checkLdapUsers(params))
      .catch(error => Promise.reject(error)),
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Contacts, { orderBy: 'username'});
