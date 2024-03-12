// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import Chart from "react-apexcharts";
import { withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';
import { useSelector } from 'react-redux';

const styles = theme => ({
  root: {
    flex: 1,
    width: 0,
  },
  chartTitle: {
    margin: theme.spacing(2, 2, 2, 2),
  },
});

function SpamDonut(props) {
  const theme = useTheme();
  const { classes } = props;
  const { actions } = useSelector(state => state.spam.stat);
  const data = {
    "no action": actions["no action"],
    "add header": actions["add header"],
    greylist: actions.greylist,
    reject: actions.reject,
  };

  return (
    <div className={classes.root}>
      <Chart
        options={{
          labels: Object.keys(data),
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
            type: 'donut',
            animations: {
              enabled: true,
              easing: 'easeinout',
              dynamicAnimation: {
                enabled: false
              },
            }
          },
          plotOptions: {
            donut: {
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
          colors: ['#66DA26', '#FF9800', '#E91E63', '#2E93fA'],
        }}
        series={Object.values(data)}
        type="donut"
        width={268}
      />
    </div>
  );
}

SpamDonut.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withTranslation()(withStyles(styles)(SpamDonut));
