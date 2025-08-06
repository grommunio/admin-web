// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Button, Grid2,
  CircularProgress, Table, TableHead, TableRow, TableCell,
  TableSortLabel, TableBody, IconButton, Tooltip } from '@mui/material';
import { fetchGroupsData, deleteGroupData } from '../actions/groups';
import { Delete } from '@mui/icons-material';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import withStyledReduxTable from '../components/withTable';
import defaultTableProptypes from '../proptypes/defaultTableProptypes';
import SearchTextfield from '../components/SearchTextfield';
import TableActionGrid from '../components/TableActionGrid';
import AddGroup from '../components/Dialogs/AddGroup';
import { syncLdapUsers } from '../actions/ldap';
import CheckLdapDialog from '../components/Dialogs/CheckLdapDialog';
import { checkLdapUsers } from '../actions/users';
import TaskCreated from '../components/Dialogs/TaskCreated';
import { useNavigate } from 'react-router';

const styles = theme => ({
  tablePaper: {
    margin: theme.spacing(3, 2, 3, 2),
    borderRadius: 6,
  },
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  count: {
    marginLeft: 16,
  },
  newButton: {
    marginRight: 8,
  },
});

const Groups = props => {
  const [state, setState] = useState({
    snackbar: '',
    checking: false,
    taskMessage: '',
    taskID: null,
  });
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const columns = [
    { label: 'Group name', value: 'listname' },
    { label: 'Type', value: 'listType' },
    { label: 'Privilege', value: 'listPrivilege' },
  ]

  const listTypes = ['Normal', 'Domain', 'Group']

  const listPrivileges = ['All', 'Internal', 'Domain', 'Specific', 'Outgoing (deprecated)']

  const handleCheckClose = () => setState({ ...state, checking: false });

  const handleCheckSuccess = () => {
    const { order, orderBy, match } = tableState;
    props.fetchTableData(domain.ID, { match: match || undefined, sort: orderBy + ',' + order })
      .then(() => setState({ ...state, checking: false }))
      .catch(msg => setState({ ...state, snackbar: msg, checking: false }));
  };

  const handleScroll = () => {
    const { Groups, count } = props.groups;
    props.handleScroll(Groups, count);
  };

  const handleNavigation = path => event => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  /* This function is not actually doing what it pretends to do.
  *  There is no endpoint to explicitely sync LDAP groups.
  *  However, LDAP groups are just users, so syncing users has the desired effect.
  */
  const handleGroupSync = importUsers => () => {
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

  const handleTaskClose = () => setState({
    ...state, 
    taskMessage: "",
    taskID: null,
  });

  const { classes, t, groups, domain, tableState, handleMatch, handleRequestSort,
    handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
    clearSnackbar, handleDelete, handleDeleteClose, handleDeleteError,
    handleDeleteSuccess, handleEdit } = props;
  const { loading, order, orderBy, match, snackbar, adding, deleting } = tableState;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  const { checking, taskMessage, taskID } = state;

  return (
    <TableViewContainer
      handleScroll={handleScroll}
      headline={t("Groups")}
      subtitle={t('mlists_sub')}
      href="https://docs.grommunio.com/admin/administration.html#groups"
      snackbar={snackbar || state.snackbar}
      onSnackbarClose={clearSnackbar}
      loading={loading}
    >
      <TableActionGrid
        tf={<SearchTextfield
          value={match}
          onChange={handleMatch}
          placeholder={t("Search groups")}
        />}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={!writable}
          className={classes.newButton}
        >
          {t('New group')}
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
            onClick={handleGroupSync(false)}
            disabled={!writable}
          >
            {t('Sync LDAP')}
          </Button>
        </Tooltip>
        <Tooltip
          placement="top"
          title={t("Import new groups from LDAP for this domain") + " " + t("and synchronize previously imported ones")}
        >
          <Button
            variant="contained"
            color="primary"
            className={classes.newButton}
            onClick={handleGroupSync(true)}
            disabled={!writable}
          >
            {t('Import LDAP')}
          </Button>
        </Tooltip>
        <Tooltip
          placement="top"
          title={t("Check status of imported groups of this domain")}
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
        {t("showingGroups", { count: groups.Groups.length })}
      </Typography>
      <Paper className={classes.tablePaper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map(column =>
                <TableCell key={column.value}>
                  <TableSortLabel
                    active={orderBy === column.value}
                    align="left" 
                    direction={orderBy === column.value ? order : 'asc'}
                    onClick={handleRequestSort(column.value)}
                  >
                    {t(column.label)}
                  </TableSortLabel>
                </TableCell>
              )}
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.Groups.map((obj, idx) =>
              <TableRow key={idx} hover onClick={handleEdit('/' + domain.ID + '/groups/' + obj.ID)}>
                <TableCell>{obj.listname}</TableCell>
                <TableCell>{t(listTypes[obj.listType])}</TableCell>
                <TableCell>{t(listPrivileges[obj.listPrivilege])}</TableCell>
                <TableCell align="right">
                  {writable && <IconButton onClick={handleDelete(obj)} size="small">
                    <Delete color="error" fontSize="small"/>
                  </IconButton>}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {(groups.Groups.length < groups.count) && <Grid2 container justifyContent="center">
          <CircularProgress color="primary" className={classes.circularProgress}/>
        </Grid2>}
      </Paper>
      <AddGroup
        open={adding}
        onSuccess={handleAddingSuccess}
        onError={handleAddingError}
        domain={domain}
        onClose={handleAddingClose}
      />
      <DomainDataDelete
        open={!!deleting}
        delete={props.delete}
        onSuccess={handleDeleteSuccess}
        onError={handleDeleteError}
        onClose={handleDeleteClose}
        item={deleting.listname}
        id={deleting.ID}
        domainID={domain.ID}
      />
      <CheckLdapDialog
        open={checking}
        onClose={handleCheckClose}
        onError={handleDeleteError}
        onSuccess={handleCheckSuccess}
      />
      <TaskCreated
        message={taskMessage}
        taskID={taskID}
        onClose={handleTaskClose}
      />
    </TableViewContainer>
  );
}

Groups.propTypes = {
  groups: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  delete: PropTypes.func.isRequired,
  sync: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = state => {
  return { groups: state.groups };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchTableData: async (domainID, params) => {
      await dispatch(fetchGroupsData(domainID, params)).catch(error => Promise.reject(error));
    },
    delete: async (domainID, id) => {
      await dispatch(deleteGroupData(domainID, id)).catch(error => Promise.reject(error));
    },
    sync: async (params, domainID) => await dispatch(syncLdapUsers(params, domainID))
      .catch(error => Promise.reject(error)),
    check: async params => await dispatch(checkLdapUsers(params))
      .catch(error => Promise.reject(error)),
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(Groups, { orderBy: 'listname'});
