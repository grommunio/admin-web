// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Paper, Typography } from '@mui/material';
import Chart from "react-apexcharts";
import { withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';

const styles = theme => ({
  root: {
    flex: 1,
    width: 0,
  },
  chartTitle: {
    margin: theme.spacing(1, 0, 0, 2),
  },
  paper: {
    paddingTop: 1,
    display: 'flex',
  },
});

function Load(props) {
  const theme = useTheme();
  const { classes, t, load } = props;

  const formatYAxis = (value) => {
    if(value === 0) return '0%';
    if(value < 0.1) return value.toFixed(3) + '%';
    if(value < 1) return value.toFixed(2) + '%';
    return value.toFixed(1) + '%';
  };

  return (
    <Paper className={classes.paper}>
      <div className={classes.root}>
        <Typography className={classes.chartTitle}>{t("Load")}</Typography>
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
              }
            },
            legend: {
              labels: {
                colors: theme.palette.text.primary,
              },
            },
            xaxis: {
              labels: {
                rotate: 0,
                style: {
                  colors: theme.palette.text.primary,
                },
              },
              categories: [t("1 Min"), t("5 Mins"), t("15 Mins")],
            },
            tooltip: {
              y: {
                formatter: function(value) {
                  return value + '%';
                },
                title: {
                  formatter: () => "",
                }
              },
            },
            yaxis: {
              labels: {
                style: {
                  colors: theme.palette.text.primary,
                  formatter: formatYAxis,
                },
              },
              tickAmount: 4,
            },
            colors: ['#2E93fA', '#546E7A', '#E91E63', '#FF9800', '#8e9eab', '#66DA26'],
          }}
          series={[{
            data: load
          }]}
          type="bar"
          height={200}
        />
      </div>
    </Paper>
  );
}

Load.propTypes = {
  classes: PropTypes.object.isRequired,
  load: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
};


export default withTranslation()(withStyles(styles)(Load));
