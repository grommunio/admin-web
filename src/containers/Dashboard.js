// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import TopBar from "../components/TopBar";
import LoadChart from "../components/LoadChart";
import MemoryChart from "../components/MemoryChart";
import CPUPieChart from "../components/CPUPieChart";
import MemoryPieChart from "../components/MemoryPieChart";
import SwapPieChart from "../components/SwapPieChart";
import DisksChart from "../components/DisksChart";
import CPULineChart from "../components/CPULineChart";
import ServicesChart from "../components/ServicesChart";
import AntispamStatistics from "../components/AntispamStatistics";
import { Paper, Typography, IconButton } from "@material-ui/core";
import Refresh from "@material-ui/icons/Update";
import { connect } from "react-redux";
import { fetchDashboardData } from "../actions/dashboard";
import { fetchAntispamData } from "../actions/antispam";
import { withTranslation } from "react-i18next";
import { fetchServicesData } from "../actions/services";
import Feedback from "../components/Feedback";

const styles = (theme) => ({
  root: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    overflowX: "hidden",
  },
  toolbar: theme.mixins.toolbar,
  flexRow: {
    display: "flex",
    flex: 1,
    alignItems: "center",
  },
  flexRowEnd: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartTitle: {
    margin: theme.spacing(2, 3),
  },
  fixedPaper: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 8,
    minWidth: "300px",
  },
  pieChartsPaper: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 8,
    padding: theme.spacing(0, 0, 2, 0),
  },
  pieChartContainer: {
    minWidth: 300,
  },
  iconButton: {
    color: "black",
  },
  paperGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "1fr",
    },
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "1fr",
    },
  },
});

class Dashboard extends Component {
  componentDidMount() {
    this.props.fetch().catch((msg) => this.setState({ snackbar: msg }));
    this.props.fetchServices().catch((msg) => this.setState({ snackbar: msg }));
    this.props.fetchAntispam().catch((msg) => this.setState({ snackbar: msg }));
    this.fetchDashboard();
  }

  state = {
    snackbar: null,
  };

  fetchInterval = null;

  fetchDashboard() {
    this.fetchInterval = setInterval(() => {
      this.props.fetch().catch((msg) => this.setState({ snackbar: msg }));
    }, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const {
      classes,
      t,
      cpuPercent,
      disks,
      memory,
      swap,
      swapPercent,
      load,
      fetchServices,
      statistics,
    } = this.props;
    const { snackbar } = this.state;

    return (
      <div className={classes.root}>
        <TopBar />
        <div className={classes.toolbar} />
        <Typography variant="h2" className={classes.pageTitle}>
          {t("Dashboard")}
        </Typography>
        <AntispamStatistics data={statistics}/>
        <div className={classes.grid}>
          <ServicesChart />
        </div>
        <Paper className={classes.pieChartsPaper} elevation={1}>
          <div className={classes.pieChartContainer}>
            <CPUPieChart cpuPercent={cpuPercent} />
          </div>
          <div className={classes.pieChartContainer}>
            <MemoryPieChart memory={memory} />
          </div>
          <div className={classes.pieChartContainer}>
            <SwapPieChart swap={swap} swapPercent={swapPercent} />
          </div>
        </Paper>
        <div className={classes.paperGrid}>
          <Paper className={classes.fixedPaper} elevation={1}>
            <CPULineChart cpuPercent={cpuPercent} />
          </Paper>
          <Paper className={classes.fixedPaper} elevation={1}>
            <MemoryChart memory={memory} />
          </Paper>
          <Paper className={classes.fixedPaper} elevation={1}>
            <DisksChart disks={disks} />
          </Paper>
          <Paper className={classes.fixedPaper} elevation={1}>
            <LoadChart load={load} />
          </Paper>
        </div>
        <Feedback
          snackbar={snackbar}
          onClose={() => this.setState({ snackbar: "" })}
        />
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchServices: PropTypes.func.isRequired,
  fetchAntispam: PropTypes.func.isRequired,
  cpuPercent: PropTypes.array.isRequired,
  disks: PropTypes.array.isRequired,
  memory: PropTypes.array.isRequired,
  swap: PropTypes.array.isRequired,
  statistics: PropTypes.array.isRequired,
  swapPercent: PropTypes.number,
  load: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => {
  return {
    ...state.dashboard.Dashboard,
    ...state.antispam,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetch: async () =>
      await dispatch(fetchDashboardData()).catch((error) =>
        Promise.reject(error)
      ),
    fetchServices: async () =>
      await dispatch(fetchServicesData()).catch((error) =>
        Promise.reject(error)
      ),
    fetchAntispam: async () =>
      await dispatch(fetchAntispamData()).catch((error) =>
        Promise.reject(error)
      ),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(styles)(Dashboard)));

/*
        <Paper className={classes.fixedPaper} elevation={1}>
          <div className={classes.flexRow}>
            <Typography className={classes.chartTitle} variant="h5">
              {t("Services")}
            </Typography>
            <div className={classes.flexRowEnd}>
              <IconButton onClick={fetchServices} style={{ marginRight: 24 }}>
                <Refresh color="primary" />
              </IconButton>
            </div>
          </div>
          <ServicesChart />
        </Paper>
        */