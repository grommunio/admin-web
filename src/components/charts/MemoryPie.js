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

function MemoryPie(props) {
  const { classes, memoryPie } = props;

  return (
    <div className={classes.root}>
      <Chart
        options={{
          labels: memoryPie.labels,
          responsive: [{
            breakpoint: 268,
            options: {
              chart: {
                width: 268
              },
              legend: {
                position: 'bottom'
              }
            }
          }],
          chart: {
            width: 268,
            type: 'pie',
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 100,
              dynamicAnimation: {
                enabled: false
              },
            }
          },
          legend: {
            position: 'bottom',
            width: 268,
          },
          tooltip: {
            enabled: false,
          },
          plotOptions: {
            pie: {
              expandOnClick: false,
            },
          },
          states: {
            hover: {
              filter: {
                type: 'none',
              }
            },
          },
          dataLabels: {
            style: {
              colors: ['#000']
            },
            dropShadow: {
              enabled: false,
            }
          },
          colors: ['#66DA26', '#546E7A', '#E91E63', '#FF9800'],
        }}
        series={memoryPie.values}
        type="pie"
        width={268}
      />
    </div>
  );
}

MemoryPie.propTypes = {
  classes: PropTypes.object.isRequired,
  memoryPie: PropTypes.object.isRequired,
};


export default withStyles(styles)(MemoryPie);
