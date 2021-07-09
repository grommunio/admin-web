// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Tooltip,
} from "@material-ui/core";
import { connect } from "react-redux";
import TopBar from "../components/TopBar";
import Feedback from "../components/Feedback";
import { fetchSyncData } from "../actions/sync";
import { CheckCircleOutlined, HighlightOffOutlined } from "@material-ui/icons";
import { getStringFromCommand, getTimePast } from "../utils";
import SyncStatistics from "../components/SyncStatistics";
import { grey, red } from "@material-ui/core/colors";

const styles = (theme) => ({
  root: {
    flex: 1,
    overflow: "auto",
  },
  base: {
    flexDirection: "column",
    padding: theme.spacing(2),
    flex: 1,
    display: "flex",
  },
  toolbar: theme.mixins.toolbar,
  pageTitle: {
    margin: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  defaultRow: {
    fontWeight: 400,
  },
  terminated: {
    color: grey['500'],
    fontWeight: 400,
  },
  cell: {
    color: 'inherit',
    fontWeight: 'inherit',
  },
  justUpdated: {
    fontWeight: 'bold',
  },
  darkred: {
    color: red['900'],
    fontWeight: 400,
  },
  red: {
    color: red['500'],
    fontWeight: 400,
  },
});

class Sync extends PureComponent {

  state = {
    snackbar: null,
    sortedDevices: null,
    order: 'desc',
    orderBy: 'update',
    type: 'int',
  };

  columns = [
    { label: "PID", value: "pid", type: 'int', padding: "checkbox" },
    { label: "IP", value: "ip", padding: "checkbox" },
    { label: "User", value: "user" },
    { label: "Time", value: 'update' },
    { label: "Device ID", value: "devid" },
    { label: "Info", value: "addinfo" },
    { label: "Command", value: "command", type: 'int' },
  ];
  
  fetchInterval = null;
  
  componentDidMount() {
    const { orderBy, type } = this.state;
    this.props.fetch({})
      .then(this.handleSort(orderBy, type, false))
      .catch(snackbar => this.setState({ snackbar }));
    this.fetchInterval = setInterval(() => {
      this.handleRefresh();
    }, 2000);
  }
  
  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }
  
  handleNavigation = (path) => (event) => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  };
  
  handleRefresh = () => {
    const { orderBy, type } = this.state;
    this.props.fetch({})
      .then(this.handleSort(orderBy, type, false))
      .catch(snackbar => this.setState({ snackbar }));
  }

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

  getRowClass(row, diff) {
    const { classes } = this.props;
    if(row.justUpdated) return classes.justUpdated;
    if(row.ended !== 0) return classes.terminated;
    if(row.push && diff > 32) return classes.darkred;
    if(!row.push && diff > 2) return classes.red;
    return classes.defaultRow;
  }

  render() {
    const { classes, t, sync } = this.props;
    const { snackbar, sortedDevices, order, orderBy } = this.state;

    return (
      <div className={classes.root}>
        <TopBar />
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Mobile Devices")}
          </Typography>
          <SyncStatistics data={sync}/>
          <Paper elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {this.columns.map((column) => (
                    <TableCell
                      key={column.value}
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
                  ))}
                  <TableCell padding="checkbox">
                    {t('Push')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(sortedDevices || sync).map((obj, idx) => {
                  const timePast = getTimePast(obj.diff);
                  return (
                    <Tooltip key={idx} placement="top" title={obj.devtype + ' / ' + obj.devagent}>
                      <TableRow hover className={this.getRowClass(obj, obj.diff)}>
                        <TableCell className={classes.cell} padding="checkbox">{obj.pid}</TableCell>
                        <TableCell className={classes.cell} padding="checkbox">{obj.ip}</TableCell>
                        <TableCell className={classes.cell}>{obj.user}</TableCell>
                        <TableCell className={classes.cell}>{timePast}</TableCell>
                        <TableCell className={classes.cell}>{obj.devid}</TableCell>
                        <TableCell className={classes.cell}>{obj.addinfo}</TableCell>
                        <TableCell className={classes.cell}>{getStringFromCommand(obj.command)}</TableCell>
                        <TableCell className={classes.cell} padding="checkbox">
                          {obj.push ? <CheckCircleOutlined /> : <HighlightOffOutlined />}
                        </TableCell>
                      </TableRow>
                    </Tooltip>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
          <Feedback
            snackbar={snackbar}
            onClose={() => this.setState({ snackbar: "" })}
          />
        </div>
      </div>
    );
  }
}

Sync.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  sync: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return { sync: state.sync.Sync || [] };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: async (params) => {
      await dispatch(fetchSyncData(params)).catch((error) =>
        Promise.reject(error)
      );
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(Sync)));
