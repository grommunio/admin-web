// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from "react";
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from "react-i18next";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Tooltip,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  IconButton,
  TableCellProps,
  TableSortLabelProps,
} from "@mui/material";
import { fetchSyncData } from "../actions/sync";
import { CheckCircleOutlined, HelpOutline, HighlightOffOutlined } from "@mui/icons-material";
import { getStringFromCommand, getTimePast } from "../utils";
import SyncStatistics from "../components/SyncStatistics";
import { grey, red } from "@mui/material/colors";
import TableViewContainer from "../components/TableViewContainer";
import SearchTextfield from "../components/SearchTextfield";
import TableActionGrid from "../components/TableActionGrid";
import { useAppDispatch, useAppSelector } from "../store";
import { ActiveSyncSessionRow, FetchSyncParams } from "@/types/sync";
import { ChangeEvent } from "@/types/common";


const useStyles = makeStyles()(() => ({
  select: {
    maxWidth: 224,
    marginRight: 8,
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
}));

const Sync = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const sync = useAppSelector(state => state.sync.Sync);
  const [state, setState] = useState({
    snackbar: "",
    order: 'desc',
    orderBy: 'update',
    type: 'int',
    match: '',
    showPush: true,
    onlyActive: false,
    filterEnded: 20,
    filterUpdated: 120,
  });
  const [sortedDevices, setSortedDevices] = useState<ActiveSyncSessionRow[]>([]);

  const fetch = async (params: FetchSyncParams) => await dispatch(fetchSyncData(params));

  const columns = [
    { label: "PID", value: "pid", type: 'int', padding: "checkbox" },
    { label: "IP", value: "ip", padding: "checkbox", type: "string" },
    { label: "User", value: "user", type: "string" },
    { label: "Command", value: "command", type: 'int' },
    { label: "Time", value: 'update', type: 'int' },
    { label: "Device ID", value: "devid", type: "string" },
    { label: "EAS", value: "asversion", type: "string" },
    { label: "Info", value: "addinfo", type: "string" },
  ];
  
  useEffect(() => {
    handleRefresh();
    const fetchInterval = setInterval(() => {
      handleRefresh();
    }, 2000);
    return () => {
      clearInterval(fetchInterval);
    }
  }, []);

  useEffect(() => {
    const { orderBy, type } = state;
    handleSort(orderBy, type, false)();
  }, [sync]);
  
  const handleRefresh = () => {
    const { filterEnded, filterUpdated } = state;
    fetch({ filterEnded, filterUpdated })
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  /**
   * Sorts table rows
   */
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

  const getRowClass = (row: ActiveSyncSessionRow, diff: number) => {
    if(row.justUpdated) return classes.justUpdated;
    if(row.ended !== 0) return classes.terminated;
    if(row.push && diff > 32) return classes.darkred;
    if(!row.push && diff > 2) return classes.red;
    return classes.defaultRow;
  }

  // Handles search input filter
  const getMatch = (row: ActiveSyncSessionRow) => {
    const { match, showPush, onlyActive } = state;
    const lcMatch = match.toLowerCase();
    const { user, devtype, devagent, ip } = row;
    const stringMatch = (user || "").toLowerCase().includes(lcMatch) || (devtype || "").toLowerCase().includes(lcMatch) ||
      (devagent || "").toLowerCase().includes(lcMatch) || (ip || "").toLowerCase().includes(lcMatch);
    return stringMatch && (!onlyActive || row.ended === 0) && (showPush || !row.push);
  }

  const handleInput = (field: string) => ({ target: t }: ChangeEvent) => setState({ ...state, [field]: t.value });

  const handleCheckbox = (field: string) => ({ target: t }: ChangeEvent) => setState({ ...state, [field]: t.checked });

  const { snackbar, order, orderBy, match, showPush, onlyActive,
    filterEnded, filterUpdated } = state;

  return (
    <TableViewContainer
      headline={<>
        {t("Mobile devices")}
        <IconButton
          size="small"
          href="https://docs.grommunio.com/admin/administration.html#mobile-devices"
          target="_blank"
        >
          <HelpOutline fontSize="small"/>
        </IconButton>
      </>
      }
      subtitle={t('sync_sub')}
      snackbar={snackbar}
      onSnackbarClose={() => setState({...state,  snackbar: '' })}
    >
      <TableActionGrid
        tf={<SearchTextfield
          value={match}
          onChange={handleInput('match')}
          placeholder={t("Filter")}
        />}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={showPush}
              onChange={handleCheckbox('showPush')}
              color="primary"
            />
          }
          label={t('Show push connections')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={onlyActive}
              onChange={handleCheckbox('onlyActive')}
              color="primary"
            />
          }
          label={t('Only show active connections')}
        />
        <TextField
          value={filterUpdated}
          onChange={handleInput('filterUpdated')}
          label={t("Last updated (seconds)")}
          className={classes.select}
          select
          color="primary"
          fullWidth
        >
          <MenuItem value={60}>10</MenuItem>
          <MenuItem value={60}>30</MenuItem>
          <MenuItem value={60}>60</MenuItem>
          <MenuItem value={120}>120</MenuItem>
        </TextField>
        <TextField
          value={filterEnded}
          onChange={handleInput('filterEnded')}
          label={t("Last ended (seconds)")}
          className={classes.select}
          select
          color="primary"
          fullWidth
        >
          <MenuItem value={20}>3</MenuItem>
          <MenuItem value={20}>5</MenuItem>
          <MenuItem value={20}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
        </TextField>
      </TableActionGrid>
      <SyncStatistics data={sync}/>
      <Paper elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.value}
                  padding={(column.padding || 'normal') as TableCellProps["padding"]}
                >
                  <TableSortLabel
                    active={orderBy === column.value}
                    direction={order as TableSortLabelProps["direction"]}
                    onClick={handleSort(column.value, column.type, true)}
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
            {(sortedDevices || sync).map((obj: ActiveSyncSessionRow, idx: number) => {
              const timePast = getTimePast(obj.diff);
              const matches = getMatch(obj);
              return matches ? (
                <Tooltip key={idx} placement="top" title={obj.devtype + ' / ' + obj.devagent}>
                  <TableRow hover className={getRowClass(obj, obj.diff)}>
                    <TableCell className={classes.cell} padding="checkbox">{obj.pid || ''}</TableCell>
                    <TableCell className={classes.cell} padding="checkbox">{obj.ip || ''}</TableCell>
                    <TableCell className={classes.cell}>{obj.user || ''}</TableCell>
                    <TableCell className={classes.cell}>{t(getStringFromCommand(obj.command))}</TableCell>
                    <TableCell className={classes.cell}>{timePast}</TableCell>
                    <TableCell className={classes.cell}>{obj.devid || ''}</TableCell>
                    <TableCell className={classes.cell}>{obj.asversion || ''}</TableCell>
                    <TableCell className={classes.cell}>{obj.addinfo || ''}</TableCell>
                    <TableCell className={classes.cell} padding="checkbox">
                      {obj.push ? <CheckCircleOutlined /> : <HighlightOffOutlined />}
                    </TableCell>
                  </TableRow>
                </Tooltip>
              ) : null;
            })}
          </TableBody>
        </Table>
      </Paper>
    </TableViewContainer>
  );
}


export default Sync;
