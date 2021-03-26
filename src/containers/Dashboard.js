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
import { Paper, Typography } from "@material-ui/core";
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
  dashboardLayout: {
    display: 'grid',
    [theme.breakpoints.up("xs")]: {
      gridTemplateColumns: "1fr 1fr",
      gridTemplateAreas: `"antispam antispam"
                          "services services" 
                          "cpu      cpu"
                          "memory   memory"
                          "swap     swap  "
                          "disk     disk"`,
    }, 
    [theme.breakpoints.up("md")]: {
      gridTemplateColumns: '400px 1fr 1fr 1fr',
      gridTemplateAreas: `"antispam antispam antispam antispam"
                          "services      cpu      cpu  cpu   " 
                          "services   memory   memory memory "
                          "disk     swap     swap     swap"`,
    },           
  },
  antispam: {
    gridArea: 'antispam',
  },
  services: {
    gridArea: 'services',
  },
  cpu: {
    gridArea: 'cpu',
  },
  memory: {
    gridArea: 'memory',
  },
  disk: {
    gridArea: 'disk',
  },
  swap: {
    gridArea: 'swap',
  },
  donutAndLineChart: {
    display: 'grid',
    [theme.breakpoints.up("xs")]: {
      gridTemplateColumns: "1fr 1fr",
    },  
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: '300px 1fr 1fr',
    },     
  },
  donutChart: {
    [theme.breakpoints.up("xs")]: {
      gridColumn: '1 / 3',
    },   
    [theme.breakpoints.up("sm")]: {
      gridColumn: '1 / 2',
    },
  },
  lineChart: {
    [theme.breakpoints.up("xs")]: {
      gridColumn: '1 / 3',
    }, 
    [theme.breakpoints.up("sm")]: {
      gridColumn: '2 / 4',
    },   
  },
  toolbar: theme.mixins.toolbar,
  iconButton: {
    color: "black",
  },
  pageTitle: {
    margin: theme.spacing(2),
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
        <div className={classes.dashboardLayout}>
          <div className={classes.antispam}>
            <AntispamStatistics data={statistics}/>
          </div>
          <div className={classes.services}>
            <ServicesChart/>
          </div>
          <div className={classes.cpu}>
            <Paper elevation={1} className={classes.donutAndLineChart}>
              <div className={classes.donutChart}>
              <CPUPieChart cpuPercent={cpuPercent} />
              </div>
              <div className={classes.lineChart}>
                <CPULineChart cpuPercent={cpuPercent} />
              </div>
            </Paper>
          </div>
          <div className={classes.memory}>
            <Paper elevation={1} className={classes.donutAndLineChart}>
              <div className={classes.donutChart}>
              <MemoryPieChart memory={memory} />
              </div>
              <div className={classes.lineChart}>
                <MemoryChart memory={memory} />
              </div>
            </Paper>
          </div>
          <div className={classes.swap}>
            <Paper elevation={1} className={classes.donutAndLineChart}>
              <div className={classes.donutChart}>
            <SwapPieChart swap={swap} swapPercent={swapPercent} />
             </div>
              <div className={classes.lineChart}>
              <DisksChart disks={disks} />
              </div>
            </Paper>
          </div>
          <div className={classes.disk}>
            <LoadChart load={load} />
          </div>
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
