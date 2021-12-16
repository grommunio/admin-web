// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from "react";
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
  Grid,
  InputAdornment,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  IconButton,
} from "@mui/material";
import { connect } from "react-redux";
import { fetchSyncData } from "../actions/sync";
import { CheckCircleOutlined, HelpOutline, HighlightOffOutlined, Search } from "@mui/icons-material";
import { getStringFromCommand, getTimePast } from "../utils";
import SyncStatistics from "../components/SyncStatistics";
import { grey, red } from "@mui/material/colors";
import TableViewContainer from "../components/TableViewContainer";

const styles = (theme) => ({
  actions: {
    display: 'flex',
    flex: 1,
    margin: theme.spacing(0, 2, 0, 0),
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  buttonGrid: {
    padding: theme.spacing(0, 0, 2, 2),
  },
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
});

class Sync extends PureComponent {

  state = {
    snackbar: null,
    sortedDevices: null,
    order: 'desc',
    orderBy: 'update',
    type: 'int',
    match: '',
    showPush: true,
    onlyActive: false,
    filterEnded: 20,
    filterUpdated: 120,
  };

  columns = [
    { label: "PID", value: "pid", type: 'int', padding: "checkbox" },
    { label: "IP", value: "ip", padding: "checkbox" },
    { label: "User", value: "user" },
    { label: "Command", value: "command", type: 'int' },
    { label: "Time", value: 'update', type: 'int' },
    { label: "Device ID", value: "devid" },
    { label: "Info", value: "addinfo" },
  ];
  
  fetchInterval = null;
  
  componentDidMount() {
    const { orderBy, type, filterEnded, filterUpdated } = this.state;
    this.props.fetch({ filterEnded, filterUpdated })
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
    const { orderBy, type, filterEnded, filterUpdated } = this.state;
    this.props.fetch({ filterEnded, filterUpdated })
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

  getMatch(row) {
    const { match, showPush, onlyActive } = this.state;
    const lcMatch = match.toLowerCase();
    const { user, devtype, devagent, ip } = row;
    const stringMatch = user.toLowerCase().includes(lcMatch) || devtype.toLowerCase().includes(lcMatch) ||
      devagent.toLowerCase().includes(lcMatch) || ip.toLowerCase().includes(lcMatch);
    return stringMatch && (!onlyActive || row.ended === 0) && (showPush || !row.push);
  }

  handleInput = field => ({ target: t }) => this.setState({ [field]: t.value });

  handleCheckbox = field => ({ target: t }) => this.setState({ [field]: t.checked });

  render() {
    const { classes, t, sync } = this.props;
    const { snackbar, sortedDevices, order, orderBy, match, showPush, onlyActive,
      filterEnded, filterUpdated } = this.state;

    return (
      <TableViewContainer
        handleScroll={this.handleScroll}
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
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Grid container alignItems="flex-end" className={classes.buttonGrid}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showPush}
                onChange={this.handleCheckbox('showPush')}
                color="primary"
              />
            }
            label={t('Show push connections')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={onlyActive}
                onChange={this.handleCheckbox('onlyActive')}
                color="primary"
              />
            }
            label={t('Only show active connections')}
          />
          <TextField
            value={filterUpdated}
            onChange={this.handleInput('filterUpdated')}
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
            onChange={this.handleInput('filterEnded')}
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
          <div className={classes.actions}>
            <TextField
              value={match}
              onChange={this.handleInput('match')}
              placeholder={t("Filter")}
              variant="outlined"
              className={classes.textfield}
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
        <SyncStatistics data={sync}/>
        <Paper elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {this.columns.map((column) => (
                  <TableCell
                    key={column.value}
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
                ))}
                <TableCell padding="checkbox">
                  {t('Push')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(sortedDevices || sync).map((obj, idx) => {
                const timePast = getTimePast(obj.diff);
                const matches = this.getMatch(obj);
                return matches ? (
                  <Tooltip key={idx} placement="top" title={obj.devtype + ' / ' + obj.devagent}>
                    <TableRow hover className={this.getRowClass(obj, obj.diff)}>
                      <TableCell className={classes.cell} padding="checkbox">{obj.pid || ''}</TableCell>
                      <TableCell className={classes.cell} padding="checkbox">{obj.ip || ''}</TableCell>
                      <TableCell className={classes.cell}>{obj.user || ''}</TableCell>
                      <TableCell className={classes.cell}>{getStringFromCommand(obj.command)}</TableCell>
                      <TableCell className={classes.cell}>{timePast}</TableCell>
                      <TableCell className={classes.cell}>{obj.devid || ''}</TableCell>
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
