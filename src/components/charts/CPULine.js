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

function CPULine(props) {
  const theme = useTheme();
  const { classes, t, cpuPercent } = props;

  const formatYAxis = (value) => {
    return value + '%';
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
          dataLabels: {
            enabled: false,
          },
          xaxis: {
            labels: {
              show: false,
            },
          },
          legend: {
            labels: {
              colors: theme.palette.text.primary,
            },
          },
          yaxis: {
            min: 0,
            max: 100,
            tickAmount: 4,
            labels: {
              formatter: formatYAxis,
              style: {
                colors: theme.palette.text.primary,
              },
            },
          },
          tooltip: {
            x: {
              show: false,
            },
          },
          colors: ['#FF9800', '#8e9eab', '#E91E63', '#546E7A', '#2E93fA'],
        }}
        series={[{
          name: t("Interrupt"),
          data: cpuPercent.interrupt
        },{
          name: t("Steal"),
          data: cpuPercent.steal
        },{
          name: t("IO"),
          data: cpuPercent.io
        },{
          name: t("System"),
          data: cpuPercent.system
        },{
          name: t("User"),
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
  t: PropTypes.func.isRequired,
};


export default withTranslation()(withStyles(CPULine, styles));
