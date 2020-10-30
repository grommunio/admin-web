import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TopBar from '../components/TopBar';
import LoadChart from '../components/LoadChart';
import MemoryChart from '../components/MemoryChart';
import CPUPieChart from '../components/CPUPieChart';
import MemoryPieChart from '../components/MemoryPieChart';
import SwapPieChart from '../components/SwapPieChart';
import DisksChart from '../components/DisksChart';
import CPULineChart from '../components/CPULineChart';
import ServicesChart from '../components/ServicesChart';
import { Paper, Grid, Typography, IconButton, Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Refresh from '@material-ui/icons/Update';
import { connect } from 'react-redux';
import { fetchDashboardData } from '../actions/dashboard';
import { withTranslation } from 'react-i18next';
import { fetchServicesData } from '../actions/services';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflow: 'auto',
  }, 
  toolbar: theme.mixins.toolbar,
  flexRow: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
  flexRowEnd: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartTitle: {
    margin: theme.spacing(2, 3),
  },
  fixedPaper: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 8,
  },
  chipsPaper: {
    display: 'flex',
    flexWrap: 'wrap',
    borderRadius: 8,
    padding: theme.spacing(0, 0, 2, 0),
  },
  iconButton: {
    color: 'black',
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
});

class Dashboard extends Component {

  componentDidMount() {
    this.props.fetch()
      .catch(msg => this.setState({ snackbar: msg }));
    this.props.fetchServices()
      .catch(msg => this.setState({ snackbar: msg }));
    this.fetchDashboard();
  }

  state = {
    snackbar: null,
  }

  fetchInterval = null;

  fetchDashboard() {
    this.fetchInterval = setInterval(() => {
      this.props.fetch()
        .catch(msg => this.setState({ snackbar: msg }));
    }, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const { classes, t, cpuPercent, disks, memory, swap,
      swapPercent, load, fetchServices } = this.props;

    return(
      <div className={classes.root}>
        <TopBar/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Dashboard")}
          </Typography>
          <Grid container>
            <Grid item xs={12}>
              <Paper className={classes.fixedPaper} elevation={1}>
                <div className={classes.flexRow}>
                  <Typography className={classes.chartTitle} variant="h5">
                    {t('Services')}
                  </Typography>
                  <div className={classes.flexRowEnd}>
                    <IconButton onClick={fetchServices} style={{ marginRight: 24 }}>
                      <Refresh color="primary"/>
                    </IconButton>
                  </div>
                </div>
                <ServicesChart />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.chipsPaper} elevation={1}>
                <Grid container>
                  <Grid item xs={4}>
                    <CPUPieChart cpuPercent={cpuPercent}/>
                  </Grid>
                  <Grid item xs={4} className={classes.fixedPaper}>
                    <MemoryPieChart memory={memory} />
                  </Grid>
                  <Grid item xs={4} className={classes.fixedPaper}>
                    <SwapPieChart swap={swap} swapPercent={swapPercent}/>
                  </Grid>
                </Grid> 
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={1}>
                <CPULineChart cpuPercent={cpuPercent}/>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={1}>
                <MemoryChart memory={memory} />
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={1}>
                <DisksChart disks={disks}/>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={1}>
                <LoadChart load={load} />
              </Paper>
            </Grid>
          </Grid>
        </div>
        <Snackbar
          open={!!this.state.snackbar}
          onClose={() => this.setState({ snackbar: '' })}
          autoHideDuration={this.state.snackbar === 'Success!' ? 1000 : 6000}
          transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
        >
          <Alert
            onClose={() => this.setState({ snackbar: '' })}
            severity={this.state.snackbar === 'Success!' ? "success" : "error"}
            elevation={6}
            variant="filled"
          >
            {this.state.snackbar}
          </Alert>
        </Snackbar>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchServices: PropTypes.func.isRequired,
  cpuPercent: PropTypes.array.isRequired,
  disks: PropTypes.array.isRequired,
  memory: PropTypes.array.isRequired,
  swap: PropTypes.array.isRequired,
  swapPercent: PropTypes.number,
  load: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    ...state.dashboard.Dashboard,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => await dispatch(fetchDashboardData())
      .catch(error => Promise.reject(error)),
    fetchServices: async () => await dispatch(fetchServicesData())
      .catch(error => Promise.reject(error)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Dashboard)));