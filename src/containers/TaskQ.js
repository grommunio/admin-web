// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
  Grid,
  TableSortLabel,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import Search from "@mui/icons-material/Search";
import { SYSTEM_ADMIN_WRITE } from "../constants";
import { CapabilityContext } from "../CapabilityContext";
import TableViewContainer from "../components/TableViewContainer";
import { fetchTaskqData, fetchTaskqStatus, startTaskqServer, stopTaskqServer } from "../actions/taskq";
import { setDateTimeString } from "../utils";
import withStyledReduxTable from "../components/withTable";
import defaultTableProptypes from "../proptypes/defaultTableProptypes";

const styles = (theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 4, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  buttonGrid: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  chipGrid: {
    margin: theme.spacing(2, 2, 0, 2),
  },
  count: {
    marginLeft: 16,
  },
  chip: {
    margin: theme.spacing(0, 0.5),
  },
});

class TasQ extends Component {
  state = {
    snackbar: '',
  };

  columns = [
    { label: "Command", value: "command" },
    { label: "State ", value: "state" }, //The whitespace is necessary because of a country's state
    { label: "Message", value: "message" },
    { label: "Created", value: "created" },
    { label: "Updated", value: "updated" },
  ];

  componentDidMount() {
    this.props.status().catch((msg) => this.setState({ snackbar: msg }));
  }

  handleStart = () => {
    this.props.start()
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch((msg) => this.setState({ snackbar: msg }));
  }

  handleStop = () => {
    this.props.stop().catch((msg) => this.setState({ snackbar: msg }));
  }

  getTaskState(state) {
    switch(state) {
      case 0: return "Queued";
      case 1: return "Loaded";
      case 2: return "Running";
      case 3: return "Completed";
      case 4: return "Error";
      case 5: return "Cancelled";
      default: return "Unknown";
    }
  }

  handleSnackbarClose = () => {
    this.setState({
      snackbar: '',
    });
    this.props.clearSnackbar();
  }

  render() {
    const { classes, t, taskq, tableState, handleMatch, handleRequestSort,
      handleEdit } = this.props;
    const { order, orderBy, match, snackbar } = tableState;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);

    return (
      <TableViewContainer
        headline={t("Task queue")}
        href="https://docs.grommunio.com/admin/administration.html#taskq"
        // subtitle={t("taskq_sub")}
        snackbar={snackbar || this.state.snackbar}
        onSnackbarClose={this.handleSnackbarClose}
      >
        <Grid container alignItems="flex-end" className={classes.chipGrid}>
          <Chip
            className={classes.chip}
            label={t(taskq.running ? "Running" : "Not running")}
            color={taskq.running ? "success" : "secondary"}
          />
          <Chip
            className={classes.chip}
            label={t("Queued") + ": " + taskq.queued}
            color={"primary"}
          />
          <Chip
            className={classes.chip}
            label={t("Workers") + ": " + taskq.workers}
            color={"primary"}
          />
        </Grid>
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleStart}
            disabled={!writable || taskq.running}
          >
            {t("Start server")}
          </Button>
          <div className={classes.actions}>
            <TextField
              value={match}
              onChange={handleMatch}
              placeholder={t("Search tasks")}
              variant={"outlined"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="secondary" />
                  </InputAdornment>
                ),
              }}
              color="primary"
            />
          </div>
        </Grid>
        <Typography className={classes.count} color="textPrimary">
          {t("showingTaskq", { count: taskq.Tasks.length })}
        </Typography>
        <Paper elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {this.columns.map((column) => (
                  <TableCell key={column.value}>
                    <TableSortLabel
                      active={orderBy === column.value}
                      align="left"
                      direction={orderBy === column.value ? order : "asc"}
                      onClick={handleRequestSort(column.value)}
                    >
                      {t(column.label)}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {taskq.Tasks.map((obj, idx) => 
                <TableRow key={idx} hover onClick={handleEdit('/taskq/' + obj.ID)}>
                  <TableCell>{obj.command}</TableCell>
                  <TableCell>{t(this.getTaskState(obj.state))}</TableCell>
                  <TableCell>{obj.message}</TableCell>
                  <TableCell>{obj.created ? setDateTimeString(obj.created) : ''}</TableCell>
                  <TableCell>{obj.updated ? setDateTimeString(obj.updated) : ''}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {taskq.Tasks.length < taskq.count && (
            <Grid container justifyContent="center">
              <CircularProgress
                color="primary"
                className={classes.circularProgress}
              />
            </Grid>
          )}
        </Paper>
      </TableViewContainer>
    );
  }
}

TasQ.contextType = CapabilityContext;
TasQ.propTypes = {
  taskq: PropTypes.object.isRequired,
  status: PropTypes.func.isRequired,
  start: PropTypes.func.isRequired,
  stop: PropTypes.func.isRequired,
  ...defaultTableProptypes,
};

const mapStateToProps = (state) => {
  return { taskq: state.taskq };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTableData: async (params) => await dispatch(fetchTaskqData({ limit: 200, ...params }))
      .catch((error) => Promise.reject(error)),
    status: async (params) => await dispatch(fetchTaskqStatus(params))
      .catch((error) => Promise.reject(error)),
    start: async params => await dispatch(startTaskqServer(params))
      .catch((error) => Promise.reject(error)),
    stop: async params => await dispatch(stopTaskqServer(params))
      .catch((error) => Promise.reject(error)),
  };
};

export default withStyledReduxTable(
  mapStateToProps, mapDispatchToProps, styles)(TasQ, { orderBy: 'created', order: 'desc' });
