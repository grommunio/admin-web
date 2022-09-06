// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { Button, FormControl, Grid,
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
import { withStyles } from '@mui/styles';
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

class Sync extends PureComponent {

  componentDidMount() {
    const { fetch, domainID, userID } = this.props;
    const { orderBy, type } = this.state; 
    fetch(domainID, userID)
      .then(this.handleSort(orderBy, type, false))
      .catch(snackbar => this.setState({ snackbar }));
  }

  state = {
    snackbar: '',
    sortedDevices: null,
    order: 'asc',
    orderBy: 'pid',
    type: 'int',
    wipingID: '',
  };

  columns = [
    { label: "Device ID", value: "deviceid" },
    { label: "Device user", value: "deviceuser" },
    { label: "Device Type / Agent", value: "devicetype" },
    { label: "First sync", value: "firstsynctime", type: 'int' },
    { label: "Last update", value: "lastudpatetime", type: 'int' },
    { label: "AS version", value: "asversion" },
    { label: "Folders", value: "foldersSynced", type: 'int' },
    { label: "Wipe status", value: "wipeStatus", type: 'int' },
  ];

  handleSort = (attribute, type, switchOrder) => () => {
    const sortedDevices = [...this.props.sync];
    const { order: stateOrder, orderBy } = this.state;
    const order = orderBy === attribute && stateOrder === "asc" ? "desc" : "asc";
    if((switchOrder && order === 'asc') || (!switchOrder && stateOrder === 'asc')) {
      sortedDevices.sort((a, b) =>
        type !== 'int' ? a[attribute].localeCompare(b[attribute]) : a[attribute] - b[attribute]
      );
    } else {
      sortedDevices.sort((a, b) => 
        type !== 'int' ? b[attribute].localeCompare(a[attribute]) : b[attribute] - a[attribute]
      );
    }
    this.setState({ sortedDevices, order: switchOrder ? order : stateOrder, orderBy: attribute, type });
  }

  handlePasswordDialog = (wipingID) => () => this.setState({ wipingID });

  getWipeStatus(status) {
    switch(status) {
    case 0: return 'Unknown';
    case 1: return 'OK';
    case 2: return 'Pending';
    case 4: return 'Requested';
    case 8: return 'Wiped';
    default: return 'Unknown';
    }
  }

  handleRemoteWipeConfirm = password => {
    const { wipeItOffTheFaceOfEarth, domainID, userID } = this.props;
    const { wipingID } = this.state;

    wipeItOffTheFaceOfEarth(domainID, userID, wipingID, password)
      .then(() => this.updateWipeStatus(2, wipingID))
      .catch(snackbar => this.setState({ snackbar }));
  }
  
  handleRemoteWipeCancel = deviceID => () => {
    const { panicStopWiping, domainID, userID } = this.props;
    panicStopWiping(domainID, userID, deviceID)
      .then(() => this.updateWipeStatus(1, deviceID))
      .catch(snackbar => this.setState({ snackbar }));
  }

  updateWipeStatus(status, deviceID) {
    const { sortedDevices } = this.state;
    const idx = sortedDevices.findIndex(d => d.deviceid === deviceID);
    const copy = [...sortedDevices];
    copy[idx].wipeStatus = status;
    this.setState({
      snackbar: "Success!",
      sortedDevices: copy,
      wipingID: '',
    });
    return true;
  }

  handleResync = deviceID => () => {
    const { resync, domainID, userID } = this.props;

    resync(domainID, userID, deviceID)
      .then(resp => this.setState({ snackbar: 'Success! ' + (resp?.message || '') }))
      .catch(snackbar => this.setState({ snackbar }));
  }

  handleRemoteDelete = deviceID => () => {
    const { deleteDevice, domainID, userID } = this.props;

    deleteDevice(domainID, userID, deviceID)
      .then(resp => {
        const { sortedDevices } = this.state;
        const idx = sortedDevices.findIndex(d => d.deviceid === deviceID);
        const copy = [...sortedDevices];
        copy.splice(idx, 1);
        this.setState({
          snackbar: 'Success! ' + (resp?.message || ''),
          sortedDevices: copy,
        })
      })
      .catch(snackbar => this.setState({ snackbar }));
  }

  handleRemoveSyncStates = () => {
    const { deleteStates, domainID, userID } = this.props;
    deleteStates(domainID, userID)
      .then(resp => this.setState({ snackbar: 'Success! ' + (resp?.message || '') }))
      .catch(snackbar => this.setState({ snackbar }));
  }

  render() {
    const { classes, t, sync } = this.props;
    const { sortedDevices, order, orderBy, wipingID, snackbar } = this.state;

    return (
      <FormControl className={classes.form}>
        <Grid container alignItems="center"  className={classes.headline}>
          <Typography variant="h6">{t('Mobile devices')}</Typography>
          <div className={classes.flexEndContainer}>
            <Button
              variant='contained'
              //disabled={!sync.length}
              style={{ display: 'none' }}
              color="warning"
              onClick={this.handleRemoveSyncStates}
            >
              Delete sync states
            </Button>
          </div>
        </Grid>
        <Table size="small">
          <TableHead>
            <TableRow>
              {this.columns.map((column, key) =>
                <TableCell
                  key={key}
                  padding={column.padding || 'normal'}
                >
                  <TableSortLabel
                    active={orderBy === column.value}
                    align="left" 
                    direction={order}
                    onClick={this.handleSort(column.value, column.type, true)}
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
                <TableCell>{this.getWipeStatus(obj.wipeStatus)}</TableCell>
                <TableCell style={{ display: 'flex' }}>
                  {obj.wipeStatus >= 2 && <Tooltip title={t("Cancel remote wipe")} placement="top">
                    <IconButton onClick={this.handleRemoteWipeCancel(obj.deviceid)}>
                      <DoNotDisturbOn color="secondary"/>
                    </IconButton>
                  </Tooltip>}
                  {obj.wipeStatus < 2 && <Tooltip title={t("Remote wipe")} placement="top">
                    <IconButton onClick={this.handlePasswordDialog(obj.deviceid)}>
                      <CleaningServices color="error" />
                    </IconButton>
                  </Tooltip>}
                  <Tooltip title={t("Resync")} placement='top'>
                    <IconButton onClick={this.handleResync(obj.deviceid)}>
                      <SyncIcon color="primary"/>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Delete device")} placement='top'>
                    <IconButton onClick={this.handleRemoteDelete(obj.deviceid)}>
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
          onClose={this.handlePasswordDialog('')}
          onConfirm={this.handleRemoteWipeConfirm}
        />
        <Feedback
          snackbar={snackbar || ''}
          onClose={() => this.setState({ snackbar: '' })}
        />
      </FormControl>
    );
  }
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
    wipeItOffTheFaceOfEarth: async (domainID, userID, deviceID, password) =>
      await dispatch(engageRemoteWipe(domainID, userID, deviceID, password))
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
  withTranslation()(withStyles(styles)(Sync)));
