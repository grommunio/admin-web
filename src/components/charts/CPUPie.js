// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import Chart from "react-apexcharts";
import { withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';

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
  const theme = useTheme();
  const { classes, t, cpuPie } = props;
  const translatedLabels = cpuPie.labels.map(l => t(l));

  return (
    <div className={classes.root}>
      <Chart
        options={{
          labels: translatedLabels,
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
            },
            background: {
              borderRadius: 6,
              opacity: 0.8,
              enabled: theme.palette.mode === 'dark',
            },
          },
          legend: {
            position: 'bottom',
            width: 260,
            labels: {
              colors: theme.palette.text.primary,
            },
          },
          tooltip: {
            enabled: false,
          },
          colors: ['#2E93fA', '#546E7A', '#FF9800', '#8e9eab', '#E91E63', '#66DA26'],
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
  t: PropTypes.func.isRequired,
};


export default withTranslation()(withStyles(CPUPie, styles));
