// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { FormControl, Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { parseUnixtime } from '../../utils';
import { fetchUserSync } from '../../actions/users';
import { connect } from 'react-redux';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  listTextfield: {
    flex: 1,
  },
});

class Sync extends PureComponent {

  componentDidMount() {
    const { fetch, domain, user } = this.props;
    const { orderBy, type } = this.state; 
    fetch(domain, user)
      .then(this.handleSort(orderBy, type, false))
      .catch(err => console.error(err));
  }

  state = {
    snackbar: null,
    sortedDevices: null,
    order: 'asc',
    orderBy: 'pid',
    type: 'int',
  };

  columns = [
    { label: "Device ID", value: "deviceid" },
    { label: "Device user", value: "deviceid" },
    { label: "Device Type / Agent", value: "devicetype" },
    { label: "First sync", value: "firstsynctime", type: 'int' },
    { label: "Last update", value: "lastudpatetime", type: 'int' },
    { label: "AS version", value: "asversion" },
    { label: "Folders", value: "foldersSynced", type: 'int' },
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

  render() {
    const { classes, t, sync } = this.props;
    const { sortedDevices, order, orderBy } = this.state;

    return (
      <FormControl className={classes.form}>
        <Grid container alignItems="center"  className={classes.headline}>
          <Typography variant="h6">{t('Mobile devices')}</Typography>
        </Grid>
        <Table size="small">
          <TableHead>
            <TableRow>
              {this.columns.map((column, key) =>
                <TableCell
                  key={key}
                  padding={column.padding || 'default'}
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
            </TableRow>
          </TableHead>
          <TableBody>
            {(sortedDevices || sync).map((obj, idx) =>
              <TableRow key={idx}>
                <TableCell>{obj.deviceid}</TableCell>
                <TableCell>{obj.deviceuser}</TableCell>
                <TableCell>{obj.devicetype + ' / ' + obj.useragent}</TableCell>
                <TableCell>{parseUnixtime(obj.firstsynctime)}</TableCell>
                <TableCell>{parseUnixtime(obj.lastupdatetime)}</TableCell>
                <TableCell>{obj.asversion}</TableCell>
                <TableCell>{obj.foldersSynced + '/' + obj.foldersSyncable}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </FormControl>
    );
  }
}

Sync.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  sync: PropTypes.array.isRequired,
  domain: PropTypes.number,
  user: PropTypes.number,
};

const mapStateToProps = state => {
  return {
    sync: state.users.Sync || [],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async (domainID, userID) => await dispatch(fetchUserSync(domainID, userID))
      .catch(err => console.error(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Sync)));
