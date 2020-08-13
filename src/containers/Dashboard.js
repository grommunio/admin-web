import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import TopBar from '../components/TopBar';
import { Paper, Grid, Typography } from '@material-ui/core';
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
} from 'recharts';
import { green, yellow, red, blue } from '@material-ui/core/colors';
import CPUBackground from '../res/memory-black-48dp.svg';
import RAMBackground from '../res/insert_chart_outlined-black-48dp.svg';
import StorageBackground from '../res/storage-black-48dp.svg';
import NetworkBackground from '../res/network_check-black-48dp.svg';
import TimingBackground from '../res/schedule-black-48dp.svg';

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
});

class Dashboard extends Component {

  componentDidMount() {
    this.updateRAM();
    this.updateDisk();
  }

  disks = [
    {
      name: "Disk-1",
      usage: 2400,
      read: 1337,
      write: 420,
    },
    {
      name: "Disk-2",
      usage: 3333,
      read: 2424,
      write: 4242,
    },
    {
      name: "Disk-3",
      usage: 420,
      read: 500,
      write: 69,
    },
  ];

  timing = [
    {
      name: "Uptime",
      value: 1337,
    },
    {
      name: "NTP",
      value: 420,
    },
  ];

  cpu = [
    {
      name: "08:08",
      value: 24,
    },
    {
      name: "09:09",
      value: 98,
    },
    {
      name: "10:10",
      value: 1337,
    },
    {
      name: "11:11",
      value: 69,
    },
    {
      name: "12:12",
      value: 420,
    },
    {
      name: "13:13",
      value: 69,
    },
  ]

  network = [
    {
      name: "08:08",
      value: 24,
    },
    {
      name: "09:09",
      value: 11,
    },
    {
      name: "10:10",
      value: 111,
    },
    {
      name: "11:11",
      value: 21,
    },
    {
      name: "12:12",
      value: 420,
    },
    {
      name: "13:13",
      value: 42,
    },
  ]

  state = {
    ram: [
      {
        name: 1,
        shared: 69,
        buffered: 88,
        used: 10,
        available: 100,
      },
      {
        name: 2,
        shared: 65,
        buffered: 88,
        used: 10,
        available: 100,
      },
      {
        name: 3,
        shared: 53,
        buffered: 90,
        used: 10,
        available: 100,
      },
      {
        name: 4,
        shared: 56,
        buffered: 70,
        used: 10,
        available: 100,
      },
      {
        name: 5,
        shared: 42,
        buffered: 50,
        used: 10,
        available: 100,
      },
      {
        name: 6,
        shared: 50,
        buffered: 69,
        used: 10,
        available: 100,
      },
    ],
    disk: [
      {
        name: 1,
        shared: 69,
        buffered: 88,
        used: 10,
        available: 100,
      },
      {
        name: 2,
        shared: 65,
        buffered: 88,
        used: 10,
        available: 100,
      },
      {
        name: 3,
        shared: 53,
        buffered: 90,
        used: 10,
        available: 100,
      },
      {
        name: 4,
        shared: 56,
        buffered: 70,
        used: 10,
        available: 100,
      },
      {
        name: 5,
        shared: 42,
        buffered: 50,
        used: 10,
        available: 100,
      },
      {
        name: 6,
        shared: 50,
        buffered: 69,
        used: 10,
        available: 100,
      },
    ],
  }

  updateRAM() {
    setInterval(() => {
      const copy = [...this.state.ram];
      const add = (Math.random() > 0.5 ? 5 : -5);
      copy.push({
        name: copy[copy.length - 1].name + 1,
        shared: copy[copy.length - 1].shared + add,
        used: copy[copy.length - 1].used + add,
        buffered: copy[copy.length - 1].buffered + add,
        available: 100,
      });
      if(copy.length > 12) copy.shift();
      this.setState({ ram: copy });
    }, 5000);
  }

  updateDisk() {
    setInterval(() => {
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

  render() {
    const { classes } = this.props;

    return(
      <div className={classes.root}>
        <TopBar title="Dashboard"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">
                  CPU: 69%
                </Typography>
                <div className={classes.cpuBackground}></div>
                <ResponsiveContainer width="100%" height={250} >
                  <LineChart
                    data={this.cpu}
                    margin={{ top: 4, right: 32, left: 10, bottom: 4 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="value"
                      stroke={green['500']}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">
                  RAM: {this.state.ram[this.state.ram.length - 1].used}%
                </Typography>
                <div className={classes.ramBackground}></div>
                <ResponsiveContainer width="100%" height={250} >
                  <AreaChart
                    data={this.state.ram}
                    margin={{ top: 4, right: 32, left: 10, bottom: 4 }}
                    stackOffset="expand"
                  >
                    <XAxis dataKey="name" />
                    <YAxis type="number" domain={[0, 100]}/>
                    <Tooltip />
                    <Legend />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="available"
                      fill={blue['500']}
                    /> 
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="buffered"
                      fill={red['500']}
                    />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="shared"
                      fill={green['500']}
                    />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="used"
                      fill={yellow['500']}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">Disks</Typography>
                <div className={classes.storageBackground}></div>
                <ResponsiveContainer width="100%" height={250} >
                  <BarChart barSize={30} data={this.disks}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="usage" fill={green['500']} />
                    <Bar dataKey="read" fill={blue['500']} />
                    <Bar dataKey="write" fill={red['500']} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">
                  Disk: {this.state.disk[this.state.disk.length - 1].used}%
                </Typography>
                <div className={classes.storageBackground}></div>
                <ResponsiveContainer width="100%" height={250} >
                  <AreaChart
                    data={this.state.disk}
                    margin={{ top: 4, right: 32, left: 10, bottom: 4 }}
                    stackOffset="expand"
                  >
                    <XAxis dataKey="name" />
                    <YAxis type="number" domain={[0, 100]}/>
                    <Tooltip />
                    <Legend />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="available"
                      fill={blue['500']}
                    /> 
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="buffered"
                      fill={red['500']}
                    />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="shared"
                      fill={green['500']}
                    />
                    <Area
                      strokeWidth={2}
                      type="monotone"
                      dataKey="used"
                      fill={yellow['500']}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">
                  Network: 42%
                </Typography>
                <div className={classes.networkBackground}></div>
                <ResponsiveContainer width="100%" height={250} >
                  <LineChart
                    data={this.network}
                    margin={{ top: 4, right: 32, left: 10, bottom: 4 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      strokeWidth={4}
                      type="monotone"
                      dataKey="value"
                      stroke={green['500']}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <Paper className={classes.fixedPaper} elevation={2}>
                <Typography className={classes.chartTitle} variant="h4">Timing</Typography>
                <div className={classes.timingBackground}></div>
                <ResponsiveContainer width="100%" height={250} >
                  <BarChart data={this.timing}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar barSize={60} dataKey="value" fill={green['500']} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);