// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useState } from 'react';
import { Paper, Typography, Button, Grid2,
  CircularProgress, Table, TableHead, TableRow, TableCell,
  TableSortLabel, TableBody, IconButton, Tooltip, 
  Theme} from '@mui/material';
import { fetchGroupsData, deleteGroupData } from '../actions/groups';
import { Delete } from '@mui/icons-material';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import TableViewContainer from '../components/TableViewContainer';
import SearchTextfield from '../components/SearchTextfield';
import TableActionGrid from '../components/TableActionGrid';
import AddGroup from '../components/Dialogs/AddGroup';
import { syncLdapUsers } from '../actions/ldap';
import CheckLdapDialog from '../components/Dialogs/CheckLdapDialog';
import { checkLdapUsers } from '../actions/users';
import TaskCreated from '../components/Dialogs/TaskCreated';
import { useNavigate } from 'react-router';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import { useTable } from '../hooks/useTable';
import { GroupListItem } from '@/types/groups';
import { DomainViewProps } from '@/types/common';
import { URLParams } from '@/actions/types';
import { SyncLdapParams } from '@/types/ldap';


const useStyles = makeStyles()((theme: Theme) => ({
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
}));


const Groups = ({ domain }: DomainViewProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    snackbar: '',
    checking: false,
    taskMessage: '',
    taskID: -1,
  });
  const { Groups, count } = useAppSelector(state => state.groups);
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const fetchTableData = async (params: URLParams) => await dispatch(fetchGroupsData(domain.ID, params));
  const deleteItem = async (domainID: number, id: number) => await dispatch(deleteGroupData(domainID, id));
  const sync = async (params: SyncLdapParams, domainID: number) => await dispatch(syncLdapUsers(params, domainID));
  const check = async (params: { domain:  number }) => await dispatch(checkLdapUsers(params));

  const table = useTable<GroupListItem>({
    fetchTableData,
    domain,
    defaultState: { orderBy: 'listname' },
  });

  const {
    tableState,
    handleMatch,
    clearSnackbar,
    handleAdd,
    handleAddingSuccess,
    handleAddingClose,
    handleAddingError,
    handleDelete,
    handleDeleteClose,
    handleDeleteError,
    handleDeleteSuccess,
    handleEdit,
    handleRequestSort,
  } = table;

  const columns = [
    { label: 'Group name', value: 'listname' },
    { label: 'Type', value: 'listType' },
    { label: 'Privilege', value: 'listPrivilege' },
  ]

  const listTypes = ['Normal', 'Group', 'Domain']

  const listPrivileges = ['All', 'Internal', 'Domain', 'Specific', 'Outgoing (deprecated)']

  const handleCheckClose = () => setState({ ...state, checking: false });

  const handleCheckSuccess = () => {
    const { order, orderBy, match } = tableState;
    fetchTableData({ match: match || undefined, sort: orderBy + ',' + order })
      .then(() => setState({ ...state, checking: false }))
      .catch(msg => setState({ ...state, snackbar: msg, checking: false }));
  };

  const handleScroll = () => {
    table.handleScroll(Groups, count);
  };

  const handleNavigation = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  /* This function is not actually doing what it pretends to do.
  *  There is no endpoint to explicitely sync LDAP groups.
  *  However, LDAP groups are just users, so syncing users has the desired effect.
  */
  const handleGroupSync = (importUsers: boolean) => () => {
    sync({ import: importUsers }, domain.ID)
      .then(response => {
        if(response?.taskID) {
          // Background task was created -> Show task dialog
          setState({
            ...state, 
            taskMessage: response.message || 'Task created',
            taskID: response.taskID,
          });
        } else {
          // No task created -> Reload table data
          setState({ ...state, snackbar: 'Success!' });
          fetchTableData({ match: match || undefined, sort: orderBy + ',' + order })
            .catch(msg => setState({ ...state, snackbar: msg }));
        }
      })
      .catch(msg => setState({ ...state, snackbar: msg }));
  }

  const checkUsers = async () => {
    await check({ domain: domain.ID })
      .catch(msg => setState({ ...state, snackbar: msg }));
    setState({ ...state, checking: true });
  }

  const handleTaskClose = () => setState({
    ...state, 
    taskMessage: "",
    taskID: -1,
  });


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
        {t("showingGroups", { count: Groups.length })}
      </Typography>
      <Paper className={classes.tablePaper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map(column =>
                <TableCell key={column.value}>
                  <TableSortLabel
                    active={orderBy === column.value}
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
            {Groups.map((obj: GroupListItem, idx: number) =>
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
        {(Groups.length < count) && <Grid2 container justifyContent="center">
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
        delete={deleteItem}
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
        checkUsers={checkUsers}
      />
      <TaskCreated
        message={taskMessage}
        taskID={taskID}
        onClose={handleTaskClose}
      />
    </TableViewContainer>
  );
}


export default Groups;
