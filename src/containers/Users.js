// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Button, Grid2, TableSortLabel,
  CircularProgress, Tooltip, List, ListItemButton, ListItemText, ListItemIcon, 
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  useMediaQuery} from '@mui/material';
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
import { generatePropFilterString, getUserTypeString } from '../utils';
import { AccountCircle, Groups } from '@mui/icons-material';
import TableActionGrid from '../components/TableActionGrid';
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
  filterRow: {
    display: 'flex',
    marginLeft: 16,
  }
});

const Users = props => {
  const [state, setState] = useState({
    snackbar: '',
    checking: false,
    taskMessage: '',
    taskID: null,
  });
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [mode, setMode] = useState(0);
  const [type, setType] = useState(0);
  const context = useContext(CapabilityContext);
  const navigate = useNavigate();

  const handleScroll = () => {
    const { Users, count } = props.users;
    const statuses = [];
    if(showDeactivated) statuses.push(1);
    if(mode === 0) {
      statuses.push(0, 4);
    }
    else if(mode === 4) statuses.push(4);
    else statuses.push(0);
    const filterProp = generatePropFilterString({
      displaytypeex: type,
    });
    props.handleScroll(Users, count, { filterProp, statuses });
  };

  const columns = [
    { label: 'Type', value: 'type' },
    { label: 'Display name', value: 'displayname' },
    { label: 'LDAP ID', value: 'ldapID' },
    { label: 'Storage quota limit', value: 'storagequotalimit' },
  ];

  useEffect(() => {
    const { domain, fetchTableData } = props;
    const statuses = [];
    if(showDeactivated) statuses.push(1);
    if(mode === 0) {
      statuses.push(0, 4);
    }
    else if(mode === 4) statuses.push(4);
    else statuses.push(0);
    const filterProp = generatePropFilterString({
      displaytypeex: type,
    });
    fetchTableData(domain.ID, { sort: orderBy + "," + order, filterProp, status: statuses })
      .catch(err => err);
  }, [showDeactivated, mode, type]);

  const handleNavigation = path => event => {
    event.preventDefault();
    navigate(`/${path}`);
  }

  const getMaxSizeFormatting = (size) => {
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

  const handleUserSync = importUsers => () => {
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
          const statuses = [];
          if(showDeactivated) statuses.push(1);
          if(mode === 0) {
            statuses.push(0, 4);
          }
          else if(mode === 4) statuses.push(4);
          else statuses.push(0);
          const filterProp = generatePropFilterString({
            displaytypeex: type,
          });
          setState({ ...state, snackbar: 'Success!' });
          fetchTableData(domain.ID, {
            match: match || undefined,
            sort: orderBy + ',' + order,
            filterProp,
            status: statuses
          })
            .catch(msg => setState({ ...state, ...state,snackbar: msg }));
        }
      })
      .catch(msg => setState({ ...state, snackbar: msg }));
  }

  const handleTaskClose = () => setState({
    ...state,
    taskMessage: "",
    taskID: null,
  })

  const checkUsers = () => {
    props.check({ domain: props.domain.ID })
      .catch(msg => setState({ ...state, snackbar: msg }));
    setState({ ...state, checking: true });
  }

  const handleCheckClose = () => setState({ ...state, checking: false });

  const handleSnackbarClose = () => {
    setState({ ...state, snackbar: '' });
    props.clearSnackbar();
  }

  const handleSort = orderBy => () => {
    const statuses = [];
    if(showDeactivated) statuses.push(1);
    if(mode === 0) {
      statuses.push(0, 4);
    }
    else if(mode === 4) statuses.push(4);
    else statuses.push(0);
    const filterProp = generatePropFilterString({
      displaytypeex: type,
    });
    props.handleRequestSort(orderBy, { filterProp, status: statuses })();
  }

  const handleSelect = field => (e) => {
    if(field === "mode") setMode(e.target.value);
    else if(field === "type") setType(e.target.value);
  };

  const handleMatch = (e) => {
    const statuses = [];
    if(showDeactivated) statuses.push(1);
    if(mode === 0) {
      statuses.push(0, 4);
    }
    else if(mode === 4) statuses.push(4);
    else statuses.push(0);
    const filterProp = generatePropFilterString({
      displaytypeex: type,
    });
    props.handleMatch(e, { filterProp, status: statuses })
  };

  const { classes, t, users, domain, tableState,
    handleAdd, handleAddingSuccess, handleAddingClose, handleAddingError,
    handleDelete, handleDeleteClose, handleDeleteError,
    handleDeleteSuccess, handleEdit } = props;
  const { loading, order, orderBy, match, snackbar, adding, deleting } = tableState;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
  const { checking, taskMessage, taskID } = state;

  const userCounts = users.Users.reduce((prev, curr) => {
    const isGroup = curr.properties?.displaytypeex === 1;
    const shared = curr.status === 4;
    return {
      normal: prev.normal + (!shared && !isGroup ? 1 : 0),
      group: prev.group + (isGroup ? 1 : 0),
      shared: prev.shared + (shared && !isGroup ? 1 : 0),
    }
  }, { normal: 0, group: 0, shared: 0 });

  const lgUpHidden = useMediaQuery(theme => theme.breakpoints.up('lg'));
  const lgDownHidden = useMediaQuery(theme => theme.breakpoints.down('lg'));

  return (
    <TableViewContainer
      handleScroll={handleScroll}
      headline={t("Users")}
      subtitle={t('users_sub')}
      href="https://docs.grommunio.com/admin/administration.html#users"
      snackbar={snackbar || state.snackbar}
      onSnackbarClose={handleSnackbarClose}
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
          onClick={handleNavigation(domain.ID + '/ldap')}
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
            onClick={handleUserSync(false)}
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
            onClick={handleUserSync(true)}
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
            onClick={checkUsers}
            disabled={!writable}
          >
            {t('Check LDAP')}
          </Button>
        </Tooltip>
      </TableActionGrid>
      <div className={classes.filterRow}>
        <TextField
          label={t("Mode")}
          select
          value={mode}
          onChange={handleSelect("mode")}
          size='small'
          sx={{ width: 100, mr: 1 }}
        >
          <MenuItem value={0}>All</MenuItem>
          <MenuItem value={1}>Normal</MenuItem>
          <MenuItem value={4}>Shared</MenuItem>
        </TextField>
        <TextField
          label={t("Type")}
          select
          value={type}
          onChange={handleSelect("type")}
          size='small'
          sx={{ width: 100, mr: 1 }}
        >
          <MenuItem value={0}>Normal</MenuItem>
          <MenuItem value={7}>Room</MenuItem>
          <MenuItem value={8}>Equipment</MenuItem>
        </TextField>
        <FormControlLabel
          control={<Checkbox
            checked={showDeactivated}
            onChange={() => setShowDeactivated(!showDeactivated)}
          />}
          label="Show deactivated"
        />
      </div>
      <Typography className={classes.count} color="textPrimary">
        {t("showingUser", { count: users.Users.length })}
        {` (${userCounts.normal} ${t("normal")}, ${userCounts.shared} ${t("shared")})`}
      </Typography>
      <Paper className={classes.tablePaper} elevation={1}>
        {!lgDownHidden &&
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'username'}
                    align="left" 
                    direction={orderBy === 'username' ? order : 'asc'}
                    onClick={handleSort('username')}
                    color="primary"
                    sx={{
                      color: 'text.primary',
                    }}
                  >
                    {t('Username')}
                  </TableSortLabel>
                </TableCell>
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
                      {obj.status === 4 && ` (${t("Shared")})`}
                    </TableCell>
                    <TableCell>{properties.displayname}</TableCell>
                    <TableCell>{obj.ldapID || ''}</TableCell>
                    <TableCell>{getMaxSizeFormatting(properties.storagequotalimit)}</TableCell>
                    <TableCell align="right">
                      {writable && <IconButton onClick={handleDelete(obj)} size="small">
                        <Delete color="error" fontSize="small"/>
                      </IconButton>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>}
        {!lgUpHidden &&
          <List>
            {users.Users.map((obj, idx) => 
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
          </List>}
        {(users.Users.length < users.count) && <Grid2 container justifyContent="center">
          <CircularProgress color="primary" className={classes.circularProgress}/>
        </Grid2>}
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
        onClose={handleCheckClose}
        onError={handleDeleteError}
      />
      <TaskCreated
        message={taskMessage}
        taskID={taskID}
        onClose={handleTaskClose}
      />
    </TableViewContainer>
  );
}

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
      await dispatch(fetchUsersData(domainID, {...params })).catch(error => Promise.reject(error));
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
  mapStateToProps, mapDispatchToProps, styles)(Users, { orderBy: 'username', suppressFetch: true });
