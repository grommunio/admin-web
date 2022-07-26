// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import Chart from "react-apexcharts";

const styles = theme => ({
  root: {
    flex: 1,
    width: 0,
  },
  chartTitle: {
    margin: theme.spacing(2, 2, 2, 2),
  },
});

function CPULine(props) {
  const { classes, cpuPercent } = props;

  return (
    <div className={classes.root}>
      <Chart
        options={{
          responsive: [{
            breakpoint: undefined,
            options: {}
          }],
          chart: {
            zoom: {
              enabled: false,
            },
            type: 'area',
          },
          dataLabels: {
            enabled: false,
          },
          xaxis: {
            labels: {
              show: false,
            },
            categories: [...cpuPercent.idle.keys()]
          },
          yaxis: {
            min: 0,
            max: 100,
            tickAmount: 4,
          },
          tooltip: {
            x: {
              show: false,
            },
          },
          colors: ['#FF9800', '#8e9eab', '#E91E63', '#546E7A', '#2E93fA'],
        }}
        series={[{
          name: "Interrupt",
          data: cpuPercent.interrupt
        },{
          name: "Steal",
          data: cpuPercent.steal
        },{
          name: "IO",
          data: cpuPercent.io
        },{
          name: "System",
          data: cpuPercent.system
        },{
          name: "User",
          data: cpuPercent.user
        }]}
        type="area"
        height={220}
      />
    </div>
  );
}

CPULine.propTypes = {
  classes: PropTypes.object.isRequired,
  cpuPercent: PropTypes.object.isRequired,
};


export default withStyles(styles)(CPULine);
