import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TopBar from '../components/TopBar';
import { Paper, Grid, Typography, Snackbar, Chip, IconButton } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';
import { green, yellow, red, blue, orange, grey, teal } from '@material-ui/core/colors';
import Stop from '@material-ui/icons/HighlightOff';
import Restart from '@material-ui/icons/Replay';
import Start from '@material-ui/icons/PlayCircleFilledOutlined';
import CPUBackground from '../res/memory-black-48dp.svg';
import RAMBackground from '../res/insert_chart_outlined-black-48dp.svg';
import StorageBackground from '../res/storage-black-48dp.svg';
import NetworkBackground from '../res/network_check-black-48dp.svg';
import TimingBackground from '../res/schedule-black-48dp.svg';
import { connect } from 'react-redux';
import { fetchDashboardData, serviceAction } from '../actions/dashboard';
import { withTranslation } from 'react-i18next';

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
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 16,
  },
  chartPaper: {
    padding: theme.spacing(1),
    flex: 1,
  },
  chartTitle: {
    margin: theme.spacing(2, 3),
  },
  fixedPaper: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
  },
  chipsPaper: {
    display: 'flex',
    flexWrap: 'wrap',
    borderRadius: 16,
  },
  chipContainer: {
    margin: theme.spacing(1, 2),
    display: 'flex',
    alignItems: 'center',
  },
  chipButton: {
    padding: 6,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  hugeIcon: {
    fontSize: 140,
  },
  cpuBackground: {
    width: 250,
    height: 250,
    backgroundImage: 'url(' + CPUBackground + ')',
    position: 'relative',
    zIndex: 0,
    opacity: 0.06,
    alignSelf: 'flex-end',
    margin: theme.spacing(-9, 12, -22, 0),
    backgroundSize: '100%',
  },
  ramBackground: {
    width: 250,
    height: 250,
    backgroundImage: 'url(' + RAMBackground + ')',
    position: 'relative',
    zIndex: 0,
    opacity: 0.1,
    alignSelf: 'flex-end',
    margin: theme.spacing(-9, 12, -22, 0),
    backgroundSize: '100%',
  },
  networkBackground: {
    width: 250,
    height: 250,
    backgroundImage: 'url(' + NetworkBackground + ')',
    position: 'relative',
    zIndex: 0,
    opacity: 0.06,
    alignSelf: 'flex-end',
    margin: theme.spacing(-9, 12, -22, 0),
    backgroundSize: '100%',
  },
  storageBackground: {
    width: 250,
    height: 250,
    backgroundImage: 'url(' + StorageBackground + ')',
    position: 'relative',
    zIndex: 0,
    opacity: 0.1,
    alignSelf: 'flex-end',
    margin: theme.spacing(-9, 12, -22, 0),
    backgroundSize: '100%',
  },
  timingBackground: {
    width: 250,
    height: 250,
    backgroundImage: 'url(' + TimingBackground + ')',
    position: 'relative',
    zIndex: 0,
    opacity: 0.1,
    alignSelf: 'flex-end',
    margin: theme.spacing(-9, 12, -22, 0),
    backgroundSize: '100%',
  },
  activeChip: {
    backgroundColor: green['500'],
  },
  errorChip: {
    backgroundColor: red['500'],
  },
  inactiveChip: {
    color: 'white',
    backgroundColor: grey['700'],
  },
  failedChip: {
    backgroundColor: red['700'],
  },
  activatingChip: {
    backgroundColor: orange['500'],
  },
  deactivatingChip: {
    backgroundColor: grey['300'],
  },
});

class Dashboard extends Component {

  componentDidMount() {
    this.props.fetch()
      .catch(msg => this.setState({ snackbar: msg }));
    this.fetchDashboard();
  }

  state = {
    snackbar: null,
  }

  swapColors = [green['500'], grey['700']];

  ramColors = [green['500'], blue['500'], yellow['500'], grey['700']];

  cpuColors = [green['500'], red['500'], grey['400'], teal['500'], yellow['500'], grey['700']];

  fetchInterval = null;
  fetchDashboard() {
    this.updateInterval = setInterval(() => {
      this.props.fetch()
        .catch(msg => this.setState({ snackbar: msg }));
    }, 3000);
  }

  diskInterval = null;
  updateDisk() {
    this.diskInterval = setInterval(() => {
      const copy = [...this.state.disk];
      const add = (Math.random() > 0.5 ? 5 : -5);
      copy.push({
        name: copy[copy.length - 1].name + 1,
        shared: copy[copy.length - 1].shared + add,
        used: copy[copy.length - 1].used + add,
        buffered: copy[copy.length - 1].buffered + add,
        available: 100,
      });
      if(copy.length > 12) copy.shift();
      this.setState({ disk: copy });
    }, 5000);
  }

  formatLabel(value, descimals) {
    if (value > 1000000000) return (value / 1000000000).toFixed(descimals) + 'Gb';
    if (value > 1000000) return (value / 1000000).toFixed(descimals) + 'Mb';
    if (value > 1000) return (value / 1000).toFixed(descimals) + 'Kb';
    return value + 'B';
  }

  formatTick = value => {
    return this.formatLabel(value, 0);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  getChipColor(state) {
    const { activeChip, errorChip, inactiveChip, failedChip, activatingChip, deactivatingChip } = this.props.classes;
    switch(state) {
      case 'active': return activeChip;
      case 'error': return errorChip;
      case 'inactive': return inactiveChip;
      case 'failedChip': return failedChip;
      case 'activatingChip': return activatingChip;
      case 'deactivating': return deactivatingChip;
      default: return inactiveChip;
    }
  }


  formatLastMemory(unformatted) {
    return [
      { name: 'used', value: unformatted.used },
      { name: 'buffer', value: unformatted.buffer },
      { name: 'cache', value: unformatted.cache },
      { name: 'free', value: unformatted.free },
    ];
  }

  handleServiceAction = (service, action) => () => {
    this.props.serviceAction(service, action).catch(msg => this.setState({ snackbar: msg }));
  }

  render() {
    const { classes, t, cpuPercent, disks, memory, swap, swapPercent, load, services } = this.props;
    const lastCpu = cpuPercent.length > 0 ? 
      Object.entries(cpuPercent[cpuPercent.length - 1])
        .map(arr => { return { name: arr[0], value: arr[1] }; })
      : [];
    const lastMemory = memory.length > 0 ? this.formatLastMemory(memory[memory.length - 1]) : [];

    return(
      <div className={classes.root}>
        <TopBar title="Dashboard"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <div style={{ flex: 1 }}>
                  <Typography className={classes.chartTitle} variant="h4">
                    {t('Services')}
                  </Typography>
                </div>
                <div className={classes.chipsPaper}>
                  {services.map((service, idx) =>
                    <div key={idx} className={classes.chipContainer}>
                      <Chip
                        label={service.name}
                        color="secondary"
                        className={classes.chip}
                        classes={{
                          root: classes.chip,
                          colorSecondary: this.getChipColor(service.state),
                        }}
                      />
                      <IconButton
                        onClick={this.handleServiceAction(service.unit, 'stop')}
                        className={classes.chipButton}
                      >
                        <Stop fontSize="small"/>
                      </IconButton>
                      <IconButton
                        onClick={this.handleServiceAction(service.unit, 'restart')}
                        className={classes.chipButton}
                      >
                        <Restart fontSize="small"/>
                      </IconButton>
                      <IconButton
                        onClick={this.handleServiceAction(service.unit, 'start')}
                        className={classes.chipButton}
                      >
                        <Start fontSize="small"/>
                      </IconButton>
                    </div>
                  )}
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.chipsPaper} elevation={2}>
                <Grid container>
                  <Grid item xs={4} className={classes.fixedPaper}>
                    <Typography className={classes.chartTitle} variant="h4">
                      {memory.length > 0 && `Memory: ${memory[memory.length - 1].percent}%`}
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart height={250}>
                        <Pie
                          data={lastMemory}
                          dataKey="value"
                          nameKey="name"
                          startAngle={180}
                          endAngle={-180}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill={green['500']}
                          label={data => this.formatLabel(data.payload.value)}
                        >
                          {lastMemory.map((entry, index) => 
                            <Cell
                              key={`cell-${index}`}
                              fill={this.ramColors[index  % this.ramColors.length]}
                            />
                          )}
                        </Pie>
                        <Tooltip formatter={this.formatLabel}/>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography className={classes.chartTitle} variant="h4">
                      {cpuPercent.length > 0 && `CPU: ${(100 - cpuPercent[cpuPercent.length - 1].idle).toFixed(1)}%`}
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart height={250}>
                        <Pie
                          data={lastCpu}
                          dataKey="value"
                          nameKey="name"
                          startAngle={180}
                          endAngle={-180}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill={green['500']}
                          label
                        >
                          {lastCpu.map((entry, index) => 
                            <Cell
                              key={`cell-${index}`}
                              fill={this.cpuColors[index % this.cpuColors.length]}
                            />
                          )}
                        </Pie>
                        <Tooltip/>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={4} className={classes.fixedPaper}>
                    <Typography className={classes.chartTitle} variant="h4">
                      Swap: {swapPercent}%
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart height={250}>
                        <Pie
                          data={swap}
                          dataKey="value"
                          nameKey="name"
                          startAngle={180}
                          endAngle={-180}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill={green['500']}
                          label={data => this.formatLabel(data.payload.value)}
                        >
                          {swap.map((entry, index) => 
                            <Cell
                              key={`cell-${index}`}
                              fill={this.swapColors[index % this.swapColors.length]}
                            />
                          )}
                        </Pie>
                        <Tooltip formatter={this.formatLabel}/>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid> 
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">
                  {cpuPercent.length > 0 && `CPU: ${(100 - cpuPercent[cpuPercent.length - 1].idle).toFixed(1)}%`}
                </Typography>
                <div className={classes.cpuBackground}></div>
                <ResponsiveContainer width="100%" height={250} >
                  <LineChart
                    data={cpuPercent}
                    margin={{ top: 4, right: 32, left: 10, bottom: 4 }}
                  >
                    <XAxis dataKey="usage" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="user"
                      stroke={blue['500']}
                    />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="system"
                      stroke={green['500']}
                    />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="steal"
                      stroke={yellow['500']}
                    />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="io"
                      stroke={orange['500']}
                    />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="interupt"
                      stroke={red['500']}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">
                  {memory.length > 0 && `Memory: ${memory[memory.length - 1].percent}%`}
                </Typography>
                <div className={classes.ramBackground}></div>
                <ResponsiveContainer width="100%" height={250} >
                  <AreaChart
                    data={memory}
                    margin={{ top: 4, right: 32, left: 10, bottom: 4 }}
                    stackOffset="expand"
                  >
                    <XAxis dataKey="name" />
                    <YAxis
                      type="number"
                      domain={[0, memory[0] ? memory[0].total : 0]}
                      tickFormatter={this.formatTick}
                    />
                    <Tooltip formatter={value => (value / 1000000).toFixed(0) + 'Mb'} />
                    <Legend />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="total"
                      fill={blue['500']}
                      stroke={blue['500']}
                    /> 
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="available"
                      fill={green['500']}
                      stroke={green['500']}
                    />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="used"
                      fill={yellow['500']}
                      stroke={yellow['500']}
                    />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="cache"
                      fill={orange['500']}
                      stroke={orange['500']}
                    />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="buffer"
                      fill={red['500']}
                      stroke={red['500']}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">Disks</Typography>
                <div className={classes.storageBackground}></div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={disks}
                    layout="vertical"
                    margin={{ top: 4, right: 32, left: 40, bottom: 4 }}
                  >
                    <YAxis type="category" dataKey="device" />
                    <XAxis type="number" tickFormatter={this.formatTick}/>
                    <Legend />
                    <Bar
                      dataKey="percent"
                      stackId="a"
                      fill={red['500']}
                    >
                      <LabelList formatter={this.formatLabel} dataKey="used" position="insideRight"/>
                    </Bar>
                    <Bar
                      dataKey="freePercent" 
                      stackId="a"
                      fill={green['500']}
                    >
                      <LabelList formatter={this.formatLabel} dataKey="free" position="insideLeft"/>
                    </Bar>
                    
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">Load</Typography>
                <div className={classes.timingBackground}></div>
                <ResponsiveContainer width="100%" height={250} >
                  <BarChart data={load}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar barSize={60} dataKey="value" fill={green['500']} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
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
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  cpuPercent: PropTypes.array.isRequired,
  disks: PropTypes.array.isRequired,
  memory: PropTypes.array.isRequired,
  swap: PropTypes.array.isRequired,
  swapPercent: PropTypes.number,
  load: PropTypes.array.isRequired,
  services: PropTypes.array.isRequired,
  serviceAction: PropTypes.func.isRequired,
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
    serviceAction: async (service, action) => await dispatch(serviceAction(service, action))
      .catch(error => Promise.reject(error)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Dashboard)));