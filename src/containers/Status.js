// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";
import {
  MenuItem,
  Paper,
  TableContainer,
  TextField,
  Typography,
} from "@material-ui/core";
import { connect } from "react-redux";
import { fetchVhostsData, fetchVhostStatusData } from '../actions/status';
import ServerZones from "../components/status/ServerZones";
import FilterZones from "../components/status/FilterZones";
import Connections from "../components/status/Connections";
import Requests from "../components/status/Requests";
import TableViewContainer from "../components/TableViewContainer";

const styles = (theme) => ({
  pageTitle: {
    margin: theme.spacing(2),
  },
  logViewer: {
    display: 'flex',
    flex: 1,
  },
  paper: {
    flex: 1,
    padding: theme.spacing(2),
  },
  tf: {
    margin: theme.spacing(2),
    maxWidth: 200,
  },
});

class Status extends PureComponent {

  state = {
    vhost: '',
    snackbar: null,
    data: {
      connections: {},
      sharedZones: {},
      serverZones: {},
      filterZones: {},
    },
    interval: 1000,
  };

  fetchInterval = null;

  async componentDidMount() {
    this.props.fetch()
      .then(() => {
        if(this.props.vhosts.includes('local')) this.setState({ vhost: 'local'});
      });
    this.fetchInterval = setInterval(() => {
      this.fetchData();
    }, 1000);
  }

  handleNavigation = (path) => (event) => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  };

  fetchData = async () => {
    const { vhost } = this.state;
    if(vhost) {
      const data = await this.props.fetchVhostStatus(this.state.vhost)
        .catch(snackbar => this.setState({ snackbar }));
      if(data) this.setState({ data });
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  handleIntervalChange = ({ target: t }) => {
    const interval = t.value;
    clearInterval(this.fetchInterval);
    this.setState({ interval });
    this.fetchInterval = setInterval(() => {
      this.fetchData();
    }, interval);
  }

  toSortedArray = obj => Object.entries(obj)
    .map(([server, values]) => ({ server, values }))
    .sort((a, b) => a.server === '_' ? 1 : a.server.localeCompare(b.server));

  handleChange = field => e => {
    this.setState({ [field]: e.target.value });
  }

  render() {
    const { classes, t, vhosts } = this.props;
    const { snackbar, data, interval, vhost } = this.state;
    const { connections, serverZones, filterZones } = data;
    return (
      <TableViewContainer
        headline={t("Live Status")  + ' - ' + data.hostName || ''}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <TextField
          select
          value={vhost}
          label="Vhost"
          className={classes.tf}
          onChange={this.handleChange('vhost')}
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
          onChange={this.handleIntervalChange}
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
        <Connections data={connections || {}} />
        <Typography variant="h2" className={classes.pageTitle}>
          {t("Requests")}
        </Typography>
        <Requests data={connections || {}} />
        <div className={classes.logViewer}>
          <TableContainer component={Paper} className={classes.paper}>
            <Typography style={{ marginBottom: 8 }} variant="h5">{t("Host details")}</Typography>
            <ServerZones serverZones={this.toSortedArray(serverZones || {})} />
            <FilterZones filterZones={filterZones || {}} />
          </TableContainer>
        </div>
      </TableViewContainer>
    );
  }
}

Status.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
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
