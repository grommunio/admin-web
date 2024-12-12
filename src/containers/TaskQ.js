// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useEffect, useState } from "react";
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
  Grid2,
  TableSortLabel,
  CircularProgress,
  Chip,
} from "@mui/material";
import { SYSTEM_ADMIN_WRITE } from "../constants";
import { CapabilityContext } from "../CapabilityContext";
import TableViewContainer from "../components/TableViewContainer";
import { fetchTaskqData, fetchTaskqStatus, startTaskqServer, stopTaskqServer } from "../actions/taskq";
import { getTaskState, setDateTimeString } from "../utils";
import withStyledReduxTable from "../components/withTable";
import defaultTableProptypes from "../proptypes/defaultTableProptypes";
import SearchTextfield from "../components/SearchTextfield";
import TableActionGrid from "../components/TableActionGrid";

const styles = (theme) => ({
  circularProgress: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  chipGrid: {
    padding: theme.spacing(2, 2, 0, 2),
  },
  count: {
    marginLeft: 16,
  },
  chip: {
    margin: theme.spacing(0, 0.5),
  },
});

const TasQ = props => {
  const [state, setState] = useState({
    snackbar: '',
  });
  const context = useContext(CapabilityContext);

  const columns = [
    { label: "Command", value: "command" },
    { label: "State ", value: "state" }, //The whitespace is necessary because of a country's state
    { label: "Message", value: "message" },
    { label: "Created", value: "created" },
    { label: "Updated", value: "updated" },
  ];

  useEffect(() => {
    props.status().catch((msg) => setState({ ...state, snackbar: msg }));
  }, []);

  const handleStart = () => {
    props.start()
      .then(() => setState({ ...state, snackbar: 'Success!' }))
      .catch((msg) => setState({ ...state, snackbar: msg }));
  }

  const handleSnackbarClose = () => {
    setState({
      ...state, 
      snackbar: '',
    });
    props.clearSnackbar();
  }

  const { classes, t, taskq, tableState, handleMatch, handleRequestSort,
    handleEdit } = props;
  const { loading, order, orderBy, match, snackbar } = tableState;
  const writable = context.includes(SYSTEM_ADMIN_WRITE);

  return (
    <TableViewContainer
      headline={t("Task queue")}
      href="https://docs.grommunio.com/admin/administration.html#taskq"
      // subtitle={t("taskq_sub")}
      snackbar={snackbar || state.snackbar}
      onSnackbarClose={handleSnackbarClose}
      loading={loading}
    >
      <Grid2 container alignItems="flex-end" className={classes.chipGrid}>
        <Chip
          className={classes.chip}
          label={t(taskq.running ? "Running" : "Not running")}
          color={taskq.running ? "success" : "error"}
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
      </Grid2>
      <TableActionGrid
        tf={<SearchTextfield
          value={match}
          onChange={handleMatch}
          placeholder={t("Search tasks")}
        />}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleStart}
          disabled={!writable || taskq.running}
        >
          {t("Start server")}
        </Button>
      </TableActionGrid>
      <Typography className={classes.count} color="textPrimary">
        {t("showingTaskq", { count: taskq.Tasks.length })}
      </Typography>
      <Paper elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
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
                <TableCell>{t(getTaskState(obj.state))}</TableCell>
                <TableCell>{obj.message}</TableCell>
                <TableCell>{obj.created ? setDateTimeString(obj.created) : ''}</TableCell>
                <TableCell>{obj.updated ? setDateTimeString(obj.updated) : ''}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {taskq.Tasks.length < taskq.count && (
          <Grid2 container justifyContent="center">
            <CircularProgress
              color="primary"
              className={classes.circularProgress}
            />
          </Grid2>
        )}
      </Paper>
    </TableViewContainer>
  );
}

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
