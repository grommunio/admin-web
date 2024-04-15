// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import Chart from "react-apexcharts";
import { withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';
import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';

const styles = theme => ({
  root: {
    flex: 1,
  },
  chartTitle: {
    margin: theme.spacing(1),
  },
});

function SpamThroughput(props) {
  const theme = useTheme();
  const { classes } = props;
  const { throughput } = useSelector(state => state.spam);

  return (
    <div className={classes.root}>
      <div className={classes.chartTitle}>
        <Typography variant='h6'>
          Rspamd throughput
        </Typography>
      </div>
      <Chart
        options={{
          legend: {
            position: 'bottom',
            labels: {
              colors: theme.palette.text.primary,
            },
          },
          tooltip: {
            enabled: false,
          },
          colors: ['#E91E63', '#bf8040', '#ff6600', '#FF9800', '#8e9eab', '#66DA26'],
          xaxis: {
            show: false,
            axisTicks: {
              show: false,
            },
            tickAmount: 10,
            labels: {
              show: false, // TODO: Find a way to display 480 values (minutes) in 3h intervals (full hours)
            }
          }
        }}
        series={throughput}
        type="line"
        height={420}
      />
    </div>
  );
}

SpamThroughput.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withTranslation()(withStyles(styles)(SpamThroughput));
