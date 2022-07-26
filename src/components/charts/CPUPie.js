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

function CPUPie(props) {
  const { classes, cpuPie } = props;

  return (
    <div className={classes.root}>
      <Chart
        options={{
          labels: cpuPie.labels,
          responsive: [{
            breakpoint: 250,
            options: {
              chart: {
                width: 250
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
          legend: {
            position: 'bottom',
            width: 260,
          },
          tooltip: {
            enabled: false,
          },
          colors: ['#2E93fA', '#546E7A', '#E91E63', '#FF9800', '#8e9eab', '#66DA26'],
        }}
        series={cpuPie.values}
        type="pie"
        width={268}
      />
    </div>
  );
}

CPUPie.propTypes = {
  classes: PropTypes.object.isRequired,
  cpuPie: PropTypes.object.isRequired,
};


export default withStyles(styles)(CPUPie);
