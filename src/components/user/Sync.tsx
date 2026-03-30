// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { Button, FormControl, Grid2,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TableSortLabelProps,
  Theme,
  Tooltip,
  Typography } from '@mui/material';
import { CleaningServices, DoNotDisturbOn, Sync as SyncIcon, Delete } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { parseUnixtime } from '../../utils';
import { deleteUserSync, fetchUserSync } from '../../actions/users';
import PasswordSafetyDialog from '../Dialogs/PasswordSafetyDialog';
import { cancelRemoteWipe, engageRemoteDelete, engageRemoteWipe, engageResync } from '../../actions/sync';
import Feedback from '../Feedback';
import { useAppDispatch, useAppSelector } from '../../store';
import { DeviceSyncInfo, RemoteWipeParams } from '@/types/sync';


const useStyles = makeStyles()((theme: Theme) => ({
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
}));

type SyncProps = {
  domainID: number;
  userID: number;
}

const Sync = ({ domainID, userID }: SyncProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const sync = useAppSelector(state => state.sync.Sync);
  const [state, setState] = useState({
    snackbar: '',
    order: 'asc',
    orderBy: 'pid',
    type: 'int',
    wipingID: '',
  });
  const [sortedDevices, setSortedDevices] = useState([]);

  const fetch = async (domainID: number, userID: number) => await dispatch(fetchUserSync(domainID, userID));
  const deleteStates = async (domainID: number, userID: number) => await dispatch(deleteUserSync(domainID, userID));
  const wipeItOffTheFaceOfEarth = async (domainID: number, userID: number, deviceID: string, request: RemoteWipeParams) =>
    await dispatch(engageRemoteWipe(domainID, userID, deviceID, request));
  const resync = async (domainID: number, userID: number, deviceID: string) =>
    await dispatch(engageResync(domainID, userID, deviceID));
  const deleteDevice = async (domainID: number, userID: number, deviceID: string) =>
    await dispatch(engageRemoteDelete(domainID, userID, deviceID));
  const panicStopWiping = async (domainID: number, userID: number, deviceID: string) =>
    await dispatch(cancelRemoteWipe(domainID, userID, deviceID));

  useEffect(() => {
    fetch(domainID, userID)
      .catch(snackbar => setState({ ...state, snackbar }));
  }, []);

  useEffect(() => {
    const { orderBy, type } = state;
    handleSort(orderBy, type, false)();
  }, [sync]);

  const columns = [
    { label: "Device ID", value: "deviceid" },
    { label: "Device user", value: "deviceuser" },
    { label: "Device Type / Agent", value: "devicetype" },
    { label: "First sync", value: "firstsynctime", type: 'int' },
    { label: "Last connection", value: "lastconnecttime", type: 'int' },
    { label: "AS version", value: "asversion" },
    { label: "Folders", value: "foldersSynced", type: 'int' },
    { label: "Provisioning Status", value: "wipeStatus", type: 'int' },
  ];

  const handleSort = (attribute: string, type: string, switchOrder: boolean) => () => {
    const devices = [...sync];
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

  const handlePasswordDialog = (wipingID: string) => () => setState({ ...state, wipingID });

  const getWipeStatus = (status: number) => {
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

  const handleRemoteWipeConfirm = (request: RemoteWipeParams) => {
    const { wipingID } = state;

    wipeItOffTheFaceOfEarth(domainID, userID, wipingID, request)
      .then(() => updateWipeStatus(request.status, wipingID))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const handleRemoteWipeCancel = (deviceID: string) => () => {
    panicStopWiping(domainID, userID, deviceID)
      .then(() => updateWipeStatus(1, deviceID))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const updateWipeStatus = (status: number, deviceID: string) => {
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

  const handleResync = (deviceID: string) => () => {

    resync(domainID, userID, deviceID)
      .then(resp => setState({ ...state, snackbar: 'Success! ' + (resp?.message || '') }))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  const handleRemoteDelete = (deviceID: string) => () => {

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
    deleteStates(domainID, userID)
      .then(resp => setState({ ...state, snackbar: 'Success! ' + (resp?.message || '') }))
      .catch(snackbar => setState({ ...state, snackbar }));
  }

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
              >
                <TableSortLabel
                  active={orderBy === column.value}
                  direction={order as TableSortLabelProps["direction"]}
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
          {(sortedDevices || sync).map((obj: DeviceSyncInfo, idx: number) =>
            <TableRow key={idx}>
              <TableCell>{obj.deviceid || ''}</TableCell>
              <TableCell>{obj.deviceuser || ''}</TableCell>
              <TableCell>{(obj.devicetype || '') + ' / ' + (obj.useragent || '')}</TableCell>
              <TableCell>{obj.firstsynctime ? parseUnixtime(obj.firstsynctime) : ''}</TableCell>
              <TableCell>{obj.lastconnecttime ? parseUnixtime(obj.lastconnecttime) : ''}</TableCell>
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


export default Sync;
