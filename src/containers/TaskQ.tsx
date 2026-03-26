// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect, useState } from "react";
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
  Theme,
  TableSortLabelTypeMap,
} from "@mui/material";
import { SYSTEM_ADMIN_WRITE } from "../constants";
import { CapabilityContext } from "../CapabilityContext";
import TableViewContainer from "../components/TableViewContainer";
import { fetchTaskqData, fetchTaskqStatus, startTaskqServer, stopTaskqServer } from "../actions/taskq";
import { getTaskState, setDateTimeString } from "../utils";
import SearchTextfield from "../components/SearchTextfield";
import TableActionGrid from "../components/TableActionGrid";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store";
import { makeStyles } from "tss-react/mui";
import { useTable } from "../hooks/useTable";
import { TaskListItem } from "@/types/tasks";


const useStyles = makeStyles()((theme: Theme) => ({
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
}));

const TasQ = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    snackbar: '',
  });
  const context = useContext(CapabilityContext);
  const taskq = useAppSelector(state => state.taskq);

  const fetchTableData = async (params) =>
    await dispatch(fetchTaskqData({ limit: 200, ...params }));

  const status = async () => await dispatch(fetchTaskqStatus());
  const start = async () => await dispatch(startTaskqServer());
  const stop = async () => await dispatch(stopTaskqServer());

  const table = useTable<TaskListItem>({
    fetchTableData,
    defaultState: { orderBy: 'created', order: 'desc' }
  });

  const {
    tableState,
    handleMatch,
    handleRequestSort,
    handleEdit,
    clearSnackbar
  } = table;

  const columns = [
    { label: "Command", value: "command" },
    { label: "State ", value: "state" }, //The whitespace is necessary because of a country's state
    { label: "Message", value: "message" },
    { label: "Created", value: "created" },
    { label: "Updated", value: "updated" },
  ];

  useEffect(() => {
    status().catch((msg) => setState({ ...state, snackbar: msg }));
  }, []);

  const handleStart = () => {
    start()
      .then(() => status().catch((msg) => setState({ ...state, snackbar: msg })))
      .catch((msg) => setState({ ...state, snackbar: msg }));
  }

  const handleStop = () => {
    stop()
      .then(() => status().catch((msg) => setState({ ...state, snackbar: msg })))
      .catch((msg) => setState({ ...state, snackbar: msg }));
  }

  const handleSnackbarClose = () => {
    setState({
      ...state, 
      snackbar: '',
    });
    clearSnackbar();
  }

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
        <Button
          variant="outlined"
          color="error"
          onClick={handleStop}
          disabled={!writable || !taskq.running}
          sx={{ ml: 1 }}
        >
          {t("Stop server")}
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
                    direction={orderBy === column.value ? order as TableSortLabelTypeMap["props"]["direction"] : "asc"}
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


export default TasQ;
