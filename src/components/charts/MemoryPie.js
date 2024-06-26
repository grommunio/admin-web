// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

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

function MemoryPie(props) {
  const theme = useTheme();
  const { classes, t, memoryPie } = props;
  const translatedLabels = memoryPie.labels.map(l => t(l));

  return (
    <div className={classes.root}>
      <Chart
        options={{
          labels: translatedLabels,
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
            labels: {
              colors: theme.palette.text.primary,
            },
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
            },
            background: {
              borderRadius: 6,
              opacity: 0.8,
              enabled: theme.palette.mode === 'dark',
            },
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
  t: PropTypes.func.isRequired,
  memoryPie: PropTypes.object.isRequired,
};


export default withTranslation()(withStyles(MemoryPie, styles));
