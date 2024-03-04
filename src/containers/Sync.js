// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import { withTranslation } from "react-i18next";
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
} from "@mui/material";
import { connect } from "react-redux";
import { fetchSyncData } from "../actions/sync";
import { CheckCircleOutlined, HelpOutline, HighlightOffOutlined } from "@mui/icons-material";
import { getStringFromCommand, getTimePast } from "../utils";
import SyncStatistics from "../components/SyncStatistics";
import { grey, red } from "@mui/material/colors";
import TableViewContainer from "../components/TableViewContainer";
import SearchTextfield from "../components/SearchTextfield";
import TableActionGrid from "../components/TableActionGrid";

const styles = {
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
};

const Sync = props => {
  const [state, setState] = useState({
    snackbar: null,
    order: 'desc',
    orderBy: 'update',
    type: 'int',
    match: '',
    showPush: true,
    onlyActive: false,
    filterEnded: 20,
    filterUpdated: 120,
  });
  const [sortedDevices, setSortedDevices] = useState([]);

  const columns = [
    { label: "PID", value: "pid", type: 'int', padding: "checkbox" },
    { label: "IP", value: "ip", padding: "checkbox" },
    { label: "User", value: "user" },
    { label: "Command", value: "command", type: 'int' },
    { label: "Time", value: 'update', type: 'int' },
    { label: "Device ID", value: "devid" },
    { label: "EAS", value: "asversion" },
    { label: "Info", value: "addinfo" },
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
  }, [props.sync]);
  
  const handleRefresh = () => {
    const { filterEnded, filterUpdated } = state;
    props.fetch({ filterEnded, filterUpdated })
      .catch(snackbar => setState({ ...state, snackbar }));
  }

  /**
   * Sorts table rows
   * @param {string} attribute the table attribute to sort by
   * @param {string} type either int or string expected
   * @param {Boolean} switchOrder force a switch of the previous order
   * @returns 
   */
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

  const getRowClass = (row, diff) => {
    const { classes } = props;
    if(row.justUpdated) return classes.justUpdated;
    if(row.ended !== 0) return classes.terminated;
    if(row.push && diff > 32) return classes.darkred;
    if(!row.push && diff > 2) return classes.red;
    return classes.defaultRow;
  }

  // Handles search input filter
  const getMatch = (row) => {
    const { match, showPush, onlyActive } = state;
    const lcMatch = match.toLowerCase();
    const { user, devtype, devagent, ip } = row;
    const stringMatch = user.toLowerCase().includes(lcMatch) || devtype.toLowerCase().includes(lcMatch) ||
      devagent.toLowerCase().includes(lcMatch) || ip.toLowerCase().includes(lcMatch);
    return stringMatch && (!onlyActive || row.ended === 0) && (showPush || !row.push);
  }

  const handleInput = field => ({ target: t }) => setState({ ...state, [field]: t.value });

  const handleCheckbox = field => ({ target: t }) => setState({ ...state, [field]: t.checked });

  const { classes, t, sync } = props;
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
              ))}
              <TableCell padding="checkbox">
                {t('Push')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(sortedDevices || sync).map((obj, idx) => {
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

Sync.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
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
