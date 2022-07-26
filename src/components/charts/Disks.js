// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import Chart from "react-apexcharts";

const styles = theme => ({
  root: {
    flex: 1,
    width: 0,
  },
  chartTitle: {
    margin: theme.spacing(1, 0, 0, 2),
  },
});

class Disks extends Component {

  shouldComponentUpdate(nextProps) {
    return nextProps.timer % 10 === 0;
  }

  formatYAxis = (value) => {
    return value + '%';
  };

  render() {
    const { classes, disks } = this.props;
    return (
      <div className={classes.root}>
        <Typography className={classes.chartTitle}>Disks</Typography>
        <Chart
          options={{
            responsive: [{
              breakpoint: undefined,
              options: {}
            }],
            chart: {
              type: 'bar'
            },
            plotOptions: {
              bar: {
                borderRadius: 8,
                columnWidth: '60%',
                distributed: true,
                dataLabels: {
                  orientation: "vertical",
                },
              },
            },
            dataLabels: {
              enabled: true,
              formatter: function(_, { dataPointIndex: i }) {
                return (disks[i].used / 1000000000).toFixed(1) + "GB";
              },
            },
            legend: {
              show: false
            },
            yaxis: {
              labels: {
                formatter: this.formatYAxis,
              },
              tickAmount: 4,
            },
            xaxis: {
              axisBorder: {
                show: false
              },
              axisTicks: {
                show: false
              },
              labels: {
                rotate: 0,
                hideOverlappingLabels: true,
                trim: true,
                style: {
                  colors: [],
                  fontSize: '10px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: 400,
                  cssClass: 'apexcharts-xaxis-label',
                },
              },
              categories: disks.map(d => d.mountpoint)
            },
            tooltip: {
              y: {
                formatter: function(value, { dataPointIndex: i }) {
                  const { percent, filesystem, device } = disks[i];
                  return percent + '% on ' + device + " (" + filesystem + ")"
                },
                title: {
                  formatter: () => "",
                }
              },
            },
            colors: ['#2E93fA', '#546E7A', '#E91E63', '#FF9800', '#8e9eab', '#66DA26'],
          }}
          series={[{
            data: disks.map(d => d.percent)
          }]}
          type="bar"
          height={200}
        />
      </div>
    );
  }
}

Disks.propTypes = {
  classes: PropTypes.object.isRequired,
  disks: PropTypes.array.isRequired,
  timer: PropTypes.number,
};


export default withStyles(styles)(Disks);
