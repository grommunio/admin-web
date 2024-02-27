// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import { withTranslation } from "react-i18next";
import {
  MenuItem,
  Paper,
  TableContainer,
  TextField,
  Typography,
} from "@mui/material";
import { connect } from "react-redux";
import { fetchVhostsData, fetchVhostStatusData } from '../actions/status';
import ServerZones from "../components/status/ServerZones";
import FilterZones from "../components/status/FilterZones";
import Connections from "../components/status/Connections";
import Requests from "../components/status/Requests";
import TableViewContainer from "../components/TableViewContainer";

const styles = (theme) => ({
  pageTitle: {
    margin: theme.spacing(2, 2, 1, 2),
  },
  subtitle: {
    margin: theme.spacing(0, 2, 2, 2),
  },
  logViewer: {
    display: 'flex',
    flex: 1,
  },
  paper: {
    flex: 1,
    padding: theme.spacing(2, 2, 2, 2),
  },
  tf: {
    margin: theme.spacing(2, 2, 2, 2),
    maxWidth: 200,
  },
});

const Status = props => {
  const [state, setState] = useState({
    vhost: '',
    snackbar: null,
    data: {
      connections: {},
      sharedZones: {},
      serverZones: {},
      filterZones: {},
    },
    interval: 1000,
  });

  let fetchInterval = null;

  useEffect(() => {
    props.fetch()
      .then(() => {
        if(props.vhosts.includes('local')) setState({ ...state, vhost: 'local'});
      });
    // Refresh every second by default
    fetchInterval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
    }
  }, []);

  const fetchData = async () => {
    const { vhost } = state;
    if(vhost) {
      const data = await props.fetchVhostStatus(state.vhost)
        .catch(snackbar => setState({ ...state, snackbar }));
      if(data) setState({ ...state, data });
    }
  }

  const handleIntervalChange = ({ target: t }) => {
    const interval = t.value;
    clearInterval(fetchInterval);
    setState({ ...state, interval });
    fetchInterval = setInterval(() => {
      fetchData();
    }, interval);
  }

  // Converts an object to a sorted array
  const toSortedArray = obj => Object.entries(obj)
    .map(([server, values]) => ({ server, values }))
    .sort((a, b) => a.server === '_' ? 1 : a.server.localeCompare(b.server));

  const handleChange = field => e => {
    setState({ ...state, [field]: e.target.value });
  }

  const { classes, t, vhosts } = props;
  const { snackbar, data, interval, vhost } = state;
  const { connections, serverZones, filterZones } = data;
  return (
    <TableViewContainer
      headline={t("Live status")  + (data.hostName ? ' - ' + data.hostName : '')}
      subtitle={t('livestatus_sub')}
      href="https://docs.grommunio.com/admin/administration.html#live-status"
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
    >
      <TextField
        select
        value={vhost}
        label="Vhost"
        className={classes.tf}
        onChange={handleChange('vhost')}
      >
        {vhosts.map((host, key) =>
          <MenuItem value={host} key={key}>{host}</MenuItem>
        )}
      </TextField>
      <TextField
        select
        value={interval}
        label={t("Update interval")}
        className={classes.tf}
        onChange={handleIntervalChange}
      >
        <MenuItem value={1000}>1 {t("second")}</MenuItem>
        <MenuItem value={2000}>2 {t("seconds")}</MenuItem>
        <MenuItem value={3000}>3 {t("seconds")}</MenuItem>
        <MenuItem value={5000}>5 {t("seconds")}</MenuItem>
        <MenuItem value={10000}>10 {t("seconds")}</MenuItem>
      </TextField>
      <Typography variant="h2" className={classes.pageTitle}>
        {t("Connections")}
      </Typography>
      <Typography variant="caption" className={classes.subtitle}>
        {t("Current active connections being processed")}
      </Typography>
      <Connections data={connections || {}} />
      <Typography variant="h2" className={classes.pageTitle}>
        {t("Requests")}
      </Typography>
      <Typography variant="caption" className={classes.subtitle}>
        {t("All processed requests by the services")}
      </Typography>
      <Requests data={connections || {}} />
      <div className={classes.logViewer}>
        <TableContainer component={Paper} className={classes.paper}>
          <div style={{ marginBottom: 8 }}>
            <Typography variant="h5">
              {t("Host details")}
            </Typography>
            <Typography variant="caption">
              {t("Detailed and summarized overview over all requests")}
            </Typography>
          </div>
          <ServerZones serverZones={toSortedArray(serverZones || {})} />
          <FilterZones filterZones={filterZones || {}} />
        </TableContainer>
      </div>
    </TableViewContainer>
  );
}

Status.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchVhostStatus: PropTypes.func.isRequired,
  vhosts: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => {
  return { vhosts: state.status.vhosts };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: async () => await dispatch(fetchVhostsData())
      .catch((error) => Promise.reject(error)),
    fetchVhostStatus: async name => 
      await dispatch(fetchVhostStatusData(name))
        .then(data => data)
        .catch((error) => Promise.reject(error)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(Status)));
