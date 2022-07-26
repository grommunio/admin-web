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
    margin: theme.spacing(2),
  },
});

function MemoryLine(props) {
  const { classes, memory } = props;

  const formatYAxis = (value) => {
    return (value / 1000000000).toFixed(0) + 'GB';
  };

  const formatLabel = (value) => {
    if (value > 1000000000) return (value / 1000000000).toFixed(2) + 'GB';
    if (value > 1000000) return (value / 1000000).toFixed(2) + 'MB';
    if (value > 1000) return (value / 1000).toFixed(2) + 'KB';
    return value + 'B';
  };

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
          xaxis: {
            labels: {
              show: false,
            },
            categories: [...memory.used.keys()]
          },
          yaxis: {
            labels: {
              formatter: formatYAxis,
            },
            tickAmount: 4,
            max: memory.total[0] || 4000000000,
          },
          stroke: {
            curve: 'smooth'
          },
          tooltip: {
            x: {
              show: false,
            },
            y: {
              formatter: formatLabel,
            },
          },
          dataLabels: {
            enabled: false
          },
          colors: ['#546E7A', '#FF9800', '#E91E63'],
        }}
        series={[{
          name: "Used",
          data: memory.used
        },{
          name: "Cache",
          data: memory.cache
        },{
          name: "Buffer",
          data: memory.buffer
        }]}
        type="area"
        height={220}
      />
    </div>
  );
}

MemoryLine.propTypes = {
  classes: PropTypes.object.isRequired,
  memory: PropTypes.object.isRequired,
};


export default withStyles(styles)(MemoryLine);
