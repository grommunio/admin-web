import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TopBar from '../components/TopBar';
import { Paper, Grid, Typography, Snackbar, Chip, IconButton, CircularProgress } from '@material-ui/core';
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
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';
import { green, yellow, red, blue, orange, grey, teal } from '@material-ui/core/colors';
import Stop from '@material-ui/icons/HighlightOff';
import Restart from '@material-ui/icons/Replay';
import Start from '@material-ui/icons/PlayCircleFilledOutlined';
import Refresh from '@material-ui/icons/Update';
import CPUBackground from '../res/memory-black-48dp.svg';
import RAMBackground from '../res/insert_chart_outlined-black-48dp.svg';
import StorageBackground from '../res/storage-black-48dp.svg';
import NetworkBackground from '../res/network_check-black-48dp.svg';
import TimingBackground from '../res/schedule-black-48dp.svg';
import { connect } from 'react-redux';
import { fetchDashboardData } from '../actions/dashboard';
import { serviceAction } from '../actions/services';
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
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 16,
  },
  chartPaper: {
    padding: theme.spacing(1),
    flex: 1,
  },
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
    borderRadius: 16,
  },
  chipsPaper: {
    display: 'flex',
    flexWrap: 'wrap',
    borderRadius: 16,
    padding: theme.spacing(0, 0, 2, 0),
  },
  chipContainer: {
    margin: theme.spacing(1, 2),
    display: 'flex',
    alignItems: 'center',
    flex: '0 1 auto',
    minWidth: 250,
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
  iconButton: {
    color: 'black',
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
  serviceName: {
    fontWeight: 300,
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
    starting: false,
    restarting: false,
    stoping: false,
  }

  fetchInterval = null;
  fetchDashboard() {
    this.updateInterval = setInterval(() => {
      this.props.fetch()
        .catch(msg => this.setState({ snackbar: msg }));
    }, 10000);
  }

  formatLabel(value, descimals) {
    if (value > 1000000000) return (value / 1000000000).toFixed(descimals) + 'GB';
    if (value > 1000000) return (value / 1000000).toFixed(descimals) + 'MB';
    if (value > 1000) return (value / 1000).toFixed(descimals) + 'KB';
    return value + 'B';
  }

  formatMB = value => (value / 1000000).toFixed(0) + 'MB';

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
      { name: 'free', value: unformatted.free, color: grey['700'] },
      { name: 'used', value: unformatted.used, color: green['500'] },
      { name: 'cache', value: unformatted.cache, color: yellow['500'] },
      { name: 'buffer', value: unformatted.buffer, color: blue['500'] },
    ];
  }

  formatLastCPU(unformatted) {
    return [
      { name: 'user', value: unformatted.user, color: green['500'] },
      { name: 'system', value: unformatted.system, color: red['500'] },
      { name: 'io', value: unformatted.io, color: grey['500'] },
      { name: 'steal', value: unformatted.steal, color: teal['500'] },
      { name: 'interrupt', value: unformatted.interrupt, color: yellow['500'] },
      { name: 'idle', value: unformatted.idle, color: grey['700'] },
    ].filter(obj => obj.value !== 0);
  }

  handleServiceAction = (service, action) => () => {
    this.setState({ [action + 'ing']: service.name });
    this.props.serviceAction(service.unit, action)
      .then(() => this.setState({ [action + 'ing']: false }))
      .catch(msg => this.setState({ snackbar: msg, [action + 'ing']: false }));
  }

  renderDiskLabel = (props) => {
    const {
      x, y, width, value,
    } = props;
    const radius = 12;
  
    return (
      <g>
        <text
          textAnchor="end"
          style={{ fontSize: 12 }}
          x={x + width - 4}
          y={y + radius}
          fill="#000"
        >
          {width > 80 ? value : ''}
        </text>
      </g>
    );
  };

  CPUTooltip = props => {
    if (props.active) {
      const lastIndex =  props.content._self.props.cpuPercent.length - 1;
      const newPayload = [
        { name: 'Idle', value: props.content._self.props.cpuPercent[lastIndex].idle + '%' },
        { name: 'User', value: props.content._self.props.cpuPercent[lastIndex].user + '%' },
        { name: 'System', value: props.content._self.props.cpuPercent[lastIndex].system + '%' },
        { name: 'IO', value: props.content._self.props.cpuPercent[lastIndex].io + '%' },
        { name: 'Steal', value: props.content._self.props.cpuPercent[lastIndex].steal + '%' },
        { name: 'Interrupt', value: props.content._self.props.cpuPercent[lastIndex].interrupt + '%' },
      ];
      return <DefaultTooltipContent
        {...props}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  MemoryTooltip = props => {
    if (props.active) {
      const lastIndex =  props.content._self.props.memory.length - 1;
      const newPayload = [
        { name: 'Free', value: this.formatMB(props.content._self.props.memory[lastIndex].free) },
        { name: 'Used', value: this.formatMB(props.content._self.props.memory[lastIndex].used) },
        { name: 'Cache', value: this.formatMB(props.content._self.props.memory[lastIndex].cache) },
        { name: 'Buffer', value: this.formatMB(props.content._self.props.memory[lastIndex].buffer) },
      ];
      return <DefaultTooltipContent
        {...props}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  SwapTooltip = props => {
    if (props.active) {
      const newPayload = [
        { name: 'Used', value: this.formatLabel(props.content._self.props.swap[0].value) },
        { name: 'Free', value: this.formatLabel(props.content._self.props.swap[1].value) },
      ];
      return <DefaultTooltipContent
        {...props}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  DiskTooltip = props => {
    if (props.active) {
      const newPayload = [
        { name: 'Percentage', value: props.payload[0].payload.percent },
        { name: 'Device', value: props.payload[0].payload.device },
        { name: 'Filesystem', value: props.payload[0].payload.filesystem },
      ];
      return <DefaultTooltipContent
        {...props}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  render() {
    const { classes, t, cpuPercent, disks, memory, swap,
      swapPercent, load, Services, fetchServices } = this.props;
    const { starting, restarting, stoping } = this.state;
    const lastCpu = cpuPercent.length > 0 ? this.formatLastCPU(cpuPercent[cpuPercent.length -1]) : [];
    const lastMemory = memory.length > 0 ? this.formatLastMemory(memory[memory.length - 1]) : [];

    return(
      <div className={classes.root}>
        <TopBar title="Dashboard"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <div className={classes.flexRow}>
                  <Typography className={classes.chartTitle} variant="h4">
                    {t('Services')}
                  </Typography>
                  <div className={classes.flexRowEnd}>
                    <IconButton onClick={fetchServices} style={{ marginRight: 24 }}>
                      <Refresh color="primary"/>
                    </IconButton>
                  </div>
                </div>
                <div className={classes.chipsPaper}>
                  {Services.map((service, idx) =>
                    <div key={idx} className={classes.chipContainer}>
                      <Chip
                        label={
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography className={classes.serviceName} variant="inherit">{service.name}</Typography>
                            {stoping !== service.name ? <IconButton
                              onClick={this.handleServiceAction(service, 'stop')}
                              className={classes.chipButton}
                            >
                              <Stop className={classes.iconButton} color="inherit" fontSize="small"/>
                            </IconButton> : <CircularProgress size={16}/>}
                            {restarting !== service.name ? <IconButton
                              onClick={this.handleServiceAction(service, 'restart')}
                              className={classes.chipButton}
                            >
                              <Restart className={classes.iconButton} color="inherit" fontSize="small"/>
                            </IconButton> : <CircularProgress size={16}/>}
                            {starting !== service.name ? <IconButton
                              onClick={this.handleServiceAction(service, 'start')}
                              className={classes.chipButton}
                            >
                              <Start className={classes.iconButton} color="inherit" fontSize="small"/>
                            </IconButton> : <CircularProgress size={16}/>}
                          </div>
                        }
                        color="secondary"
                        className={classes.chip}
                        classes={{
                          root: classes.chip,
                          colorSecondary: this.getChipColor(service.state),
                        }}
                      />
                    </div>
                  )}
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.chipsPaper} elevation={2}>
                <Grid container>
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
                          minAngle={1}
                          isAnimationActive={false}
                        >
                          {lastCpu.map((entry, index) =>
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: grey['700'],
                          }}
                          isAnimationActive={false}
                          content={<this.CPUTooltip />}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
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
                          endAngle={540}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill={green['500']}
                          label={data => this.formatLabel(data.payload.value)}
                          isAnimationActive={false}
                        >
                          {lastMemory.map((entry, index) => 
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          )}
                        </Pie>
                        <Tooltip
                          //formatter={this.formatLabel}
                          contentStyle={{
                            backgroundColor: grey['700'],
                          }}
                          isAnimationActive={false}
                          content={<this.MemoryTooltip />}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={4} className={classes.fixedPaper}>
                    <Typography className={classes.chartTitle} variant="h4">
                      Swap: {swap.length > 0 && swap[1].value ? swapPercent + '%' : 'None'}
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
                          isAnimationActive={false}
                        >
                          {swap.map((entry, index) => 
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          )}
                        </Pie>
                        {swap.length > 0 && swap[1].value && <Tooltip
                          contentStyle={{
                            backgroundColor: grey['700'],
                          }} 
                          //formatter={this.formatLabel}
                          isAnimationActive={false}
                          content={<this.SwapTooltip />}
                        />}
                        {swap.length > 0 && swap[1].value && <Legend />}
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
                    margin={{ top: 0, right: 32, left: 10, bottom: 16 }}
                  >
                    <XAxis dataKey="usage" />
                    <YAxis domain={[0, 100]}/>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: grey['900'],
                      }}
                      isAnimationActive={false}
                    />
                    <Legend />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="user"
                      stroke={green['500']}
                      isAnimationActive={false}
                    />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="system"
                      stroke={red['500']}
                      isAnimationActive={false}
                    />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="io"
                      stroke={grey['500']}
                      isAnimationActive={false}
                    />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="steal"
                      stroke={teal['500']}
                      isAnimationActive={false}
                    />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="interupt"
                      stroke={yellow['500']}
                      isAnimationActive={false}
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
                    margin={{ top: 0, right: 32, left: 10, bottom: 16 }}
                    stackOffset="expand"
                  >
                    <XAxis dataKey="name" />
                    <YAxis
                      type="number"
                      domain={[0, memory[0] ? memory[0].total : 0]}
                      tickFormatter={this.formatTick}
                    />
                    <Tooltip
                      formatter={this.formatMB}
                      contentStyle={{
                        backgroundColor: grey['500'],
                        color: 'white',
                      }}
                      isAnimationActive={false}
                    />
                    <Legend />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="total"
                      fill={grey['900']}
                      stroke={grey['900']}
                      isAnimationActive={false}
                    /> 
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="free"
                      fill={grey['700']}
                      stroke={grey['700']}
                      isAnimationActive={false}
                    />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="used"
                      fill={green['500']}
                      stroke={green['500']}
                      isAnimationActive={false}
                    />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="cache"
                      fill={yellow['500']}
                      stroke={yellow['500']}
                      isAnimationActive={false}
                    />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="buffer"
                      fill={blue['500']}
                      stroke={blue['500']}
                      isAnimationActive={false}
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
                    margin={{ top: 0, right: 32, left: 40, bottom: 4 }}
                  >
                    <YAxis type="category" dataKey="mountpoint" />
                    <XAxis type="number"/>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: grey['500'],
                      }}
                      isAnimationActive={false}
                      content={<this.DiskTooltip />}
                    />
                    <Bar
                      dataKey="percent"
                      stackId="a"
                      isAnimationActive={false}
                    >
                      {disks.map((entry, index) =>
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.percent > 90 ? red['500'] : entry.percent > 80 ? yellow['500'] : green['500']}
                        />
                      )}
                      <LabelList
                        dataKey="insideLabel"
                        position="insideRight"
                        style={{ fill: 'black' }}
                      />
                      <LabelList
                        dataKey="outsideLabel"
                        position="right"
                        style={{ fill: 'black' }}
                      />
                    </Bar>
                    <Bar
                      dataKey="freePercent" 
                      stackId="a"
                      fill={"rgba(0, 0, 0, 0)"}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">Load</Typography>
                <div className={classes.timingBackground}></div>
                <ResponsiveContainer width="100%" height={250} >
                  <BarChart data={load} margin={{ top: 0, right: 32, left: 10, bottom: 16 }}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Legend />
                    <Bar
                      isAnimationActive={false}
                      barSize={60}
                      dataKey="value"
                      fill={green['500']}
                    />
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
  fetchServices: PropTypes.func.isRequired,
  cpuPercent: PropTypes.array.isRequired,
  disks: PropTypes.array.isRequired,
  memory: PropTypes.array.isRequired,
  swap: PropTypes.array.isRequired,
  swapPercent: PropTypes.number,
  load: PropTypes.array.isRequired,
  Services: PropTypes.array.isRequired,
  serviceAction: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    ...state.dashboard.Dashboard,
    Services: state.services.Services,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => await dispatch(fetchDashboardData())
      .catch(error => Promise.reject(error)),
    serviceAction: async (service, action) => await dispatch(serviceAction(service, action))
      .catch(error => Promise.reject(error)),
    fetchServices: async () => await dispatch(fetchServicesData())
      .catch(error => Promise.reject(error)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Dashboard)));