// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { Button, FormControl, Grid2,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography } from '@mui/material';
import { CleaningServices, DoNotDisturbOn, Sync as SyncIcon, Delete } from '@mui/icons-material';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { parseUnixtime } from '../../utils';
import { deleteUserSync, fetchUserSync } from '../../actions/users';
import { connect } from 'react-redux';
import PasswordSafetyDialog from '../Dialogs/PasswordSafetyDialog';
import { cancelRemoteWipe, engageRemoteDelete, engageRemoteWipe, engageResync } from '../../actions/sync';
import Feedback from '../Feedback';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  listItem: {
    padding: theme.spacing(1, 0, 1, 0),
  },
  listTextfield: {
    flex: 1,
  },
  flexEndContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
  },
});

const Sync = props => {
  const [state, setState] = useState({
    snackbar: '',
    order: 'asc',
    orderBy: 'pid',
    type: 'int',
    wipingID: '',
  });
  const [sortedDevices, setSortedDevices] = useState([]);

  useEffect(() => {
    const { fetch, domainID, userID } = props;
    fetch(domainID, userID)
      .catch(snackbar => setState({ ...state, snackbar }));
  }, []);

  useEffect(() => {
    const { orderBy, type } = state; 
    handleSort(orderBy, type, false)();
  }, [props.sync]);

  const columns = [
    { label: "Device ID", value: "deviceid" },
    { label: "Device user", value: "deviceuser" },
    { label: "Device Type / Agent", value: "devicetype" },
    { label: "First sync", value: "firstsynctime", type: 'int' },
    { label: "Last update", value: "lastudpatetime", type: 'int' },
    { label: "AS version", value: "asversion" },
    { label: "Folders", value: "foldersSynced", type: 'int' },
    { label: "Wipe status", value: "wipeStatus", type: 'int' },
  ];

  const handleSort = (attribute, type, switchOrder) => () => {
    const devices = [...props.sync];
    const { order: stateOrder, orderBy } = state;
    const order = orderBy === attribute && stateOrder === "asc" ? "desc" : "asc";
    if((switchOrder && order === 'asc') || (!switchOrder && stateOrder === 'asc')) {
      devices.sort((a, b) =>
        type !== 'int' ? a[attribute].localeCompare(b[attribute]) : a[attribute] - b[attribute]
      );
    } else {
      devices.sort((a, b) => 
        type !== 'int' ? b[attribute].localeCompare(a[attribute]) : b[attribute] - a[attribute]
      );
    }
    setSortedDevices(devices);
    setState({ ...state, order: switchOrder ? order : stateOrder, orderBy: attribute, type });
  }

  const handlePasswordDialog = (wipingID) => () => setState({ ...state, wipingID });

  const getWipeStatus = (status) => {
    switch(status) {
    case 0: return 'Unknown';
    case 1: return 'OK';
    case 2: return 'Wipe pending';
    case 4: return 'Requested';
    case 8: return 'Wiped';
    case 16: return 'Account-only wipe pending'
    default: return 'Unknown';
    }
  }

  const handleRemoteWipeConfirm = request => {
    const { wipeItOffTheFaceOfEarth, domainID, userID } = props;
    const { wipingID } = state;

    wipeItOffTheFaceOfEarth(domainID, userID, wipingID, request)
      .then(() => updateWipeStatus(request.status, wipingID))
      .catch(snackbar => setState({ ...state, snackbar }));
  }
  
  const handleRemoteWipeCancel = deviceID => () => {
    const { panicStopWiping, domainID, userID } = props;
    panicStopWiping(domainID, userID, deviceID)
      .then(() => updateWipeStatus(1, deviceID))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const updateWipeStatus = (status, deviceID) => {
    const idx = sortedDevices.findIndex(d => d.deviceid === deviceID);
    const copy = [...sortedDevices];
    if(idx !== -1) copy[idx].wipeStatus = status;
    setState({
      ...state,
      snackbar: "Success!",
      wipingID: '',
    });
    setSortedDevices(copy);
    return true;
  }

  const handleResync = deviceID => () => {
    const { resync, domainID, userID } = props;

    resync(domainID, userID, deviceID)
      .then(resp => setState({ ...state, snackbar: 'Success! ' + (resp?.message || '') }))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const handleRemoteDelete = deviceID => () => {
    const { deleteDevice, domainID, userID } = props;

    deleteDevice(domainID, userID, deviceID)
      .then(resp => {
        const idx = sortedDevices.findIndex(d => d.deviceid === deviceID);
        const copy = [...sortedDevices];
        copy.splice(idx, 1);
        setState({
          ...state, 
          snackbar: 'Success! ' + (resp?.message || ''),
        });
        setSortedDevices(copy);
      })
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const handleRemoveSyncStates = () => {
    const { deleteStates, domainID, userID } = props;
    deleteStates(domainID, userID)
      .then(resp => setState({ ...state, snackbar: 'Success! ' + (resp?.message || '') }))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const { classes, t, sync } = props;
  const { order, orderBy, wipingID, snackbar } = state;

  return (
    <FormControl className={classes.form}>
      <Grid2 container alignItems="center"  className={classes.headline}>
        <Typography variant="h6">{t('Mobile devices')}</Typography>
        <div className={classes.flexEndContainer}>
          <Button
            variant='contained'
            //disabled={!sync.length}
            style={{ display: 'none' }}
            color="warning"
            onClick={handleRemoveSyncStates}
          >
              Delete sync states
          </Button>
        </div>
      </Grid2>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column, key) =>
              <TableCell
                key={key}
                padding={column.padding || 'normal'}
              >
                <TableSortLabel
                  active={orderBy === column.value}
                  align="left" 
                  direction={order}
                  onClick={handleSort(column.value, column.type, true)}
                >
                  {t(column.label)}
                </TableSortLabel>
              </TableCell>
            )}
            <TableCell padding="checkbox">{t('Actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(sortedDevices || sync).map((obj, idx) =>
            <TableRow key={idx}>
              <TableCell>{obj.deviceid || ''}</TableCell>
              <TableCell>{obj.deviceuser || ''}</TableCell>
              <TableCell>{(obj.devicetype || '') + ' / ' + (obj.useragent || '')}</TableCell>
              <TableCell>{obj.firstsynctime ? parseUnixtime(obj.firstsynctime) : ''}</TableCell>
              <TableCell>{obj.lastupdatetime ? parseUnixtime(obj.lastupdatetime) : ''}</TableCell>
              <TableCell>{obj.asversion || ''}</TableCell>
              <TableCell>{(obj.foldersSynced || '') + '/' + (obj.foldersSyncable || '')}</TableCell>
              <TableCell>{getWipeStatus(obj.wipeStatus)}</TableCell>
              <TableCell style={{ display: 'flex' }}>
                {[2, 4, 16].includes(obj.wipeStatus) && <Tooltip title={t("Cancel remote wipe")} placement="top">
                  <IconButton onClick={handleRemoteWipeCancel(obj.deviceid)}>
                    <DoNotDisturbOn color="secondary"/>
                  </IconButton>
                </Tooltip>}
                {obj.wipeStatus < 2 && <Tooltip title={t("Remote wipe")} placement="top">
                  <IconButton onClick={handlePasswordDialog(obj.deviceid)}>
                    <CleaningServices color="error" />
                  </IconButton>
                </Tooltip>}
                <Tooltip title={t("Resync")} placement='top'>
                  <IconButton onClick={handleResync(obj.deviceid)}>
                    <SyncIcon color="primary"/>
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("Delete device")} placement='top'>
                  <IconButton onClick={handleRemoteDelete(obj.deviceid)}>
                    <Delete color="error"/>
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PasswordSafetyDialog
        open={Boolean(wipingID)}
        deviceID={wipingID}
        onClose={handlePasswordDialog('')}
        onConfirm={handleRemoteWipeConfirm}
      />
      <Feedback
        snackbar={snackbar || ''}
        onClose={() => setState({ ...state, snackbar: '' })}
      />
    </FormControl>
  );
}

Sync.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  sync: PropTypes.array.isRequired,
  domainID: PropTypes.number,
  userID: PropTypes.number,
  wipeItOffTheFaceOfEarth: PropTypes.func.isRequired,
  resync: PropTypes.func.isRequired,
  deleteDevice: PropTypes.func.isRequired,
  panicStopWiping: PropTypes.func.isRequired,
  deleteStates: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    sync: state.users.Sync || [],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchUserSync(domainID, userID))
      .catch(err => Promise.reject(err)),
    deleteStates: async (domainID, userID) => await dispatch(deleteUserSync(domainID, userID))
      .catch(err => Promise.reject(err)),
    wipeItOffTheFaceOfEarth: async (domainID, userID, deviceID, request) =>
      await dispatch(engageRemoteWipe(domainID, userID, deviceID, request))
        .catch(err => Promise.reject(err)),
    resync: async (domainID, userID, deviceID) =>
      await dispatch(engageResync(domainID, userID, deviceID))
        .then(resp => resp)
        .catch(err => Promise.reject(err)),
    deleteDevice: async (domainID, userID, deviceID) =>
      await dispatch(engageRemoteDelete(domainID, userID, deviceID))
        .then(resp => resp)
        .catch(err => Promise.reject(err)),
    panicStopWiping: async (domainID, userID, deviceID) =>
      await dispatch(cancelRemoteWipe(domainID, userID, deviceID))
        .then(resp => resp)
        .catch(err => Promise.reject(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(Sync, styles)));
