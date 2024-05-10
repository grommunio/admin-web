// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import Chart from "react-apexcharts";
import { useTranslation, withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import { getSpamData } from '../../actions/spam';

const styles = theme => ({
  root: {
    flex: 1,
  },
  chartTitle: {
    margin: theme.spacing(1),
  },
});

function SpamDonut(props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { classes } = props;
  const stat = useSelector(state => state.spam.stat);
  const { actions, scanned } = stat;

  useEffect(() => {
    dispatch(getSpamData()).catch(props.setSnackbar);
  }, []);
  
  const data = {
    "no action": actions["no action"] || 0,
    "add header": actions["add header"] || 0,
    greylist: actions.greylist || 0,
    reject: actions.reject || 0,
  };

  return (
    <div className={classes.root}>
      <div className={classes.chartTitle}>
        <Typography variant='h6'>
          {t("Rspamd filter stats")}
        </Typography>
      </div>
      <Chart
        options={{
          labels: Object.keys(data),
          chart: {
            width: 400,
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
            pie: {
              donut: {
                size: '50%',
                labels: {
                  show: true,
                  total: {
                    show: true,
                    showAlways: true,
                    label: "Scanned",
                    color: "white",
                    formatter: () => scanned,
                  },
                }
              },
            }
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
            width: 400,
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
        width={400}
      />
    </div>
  );
}

SpamDonut.propTypes = {
  classes: PropTypes.object.isRequired,
  setSnackbar: PropTypes.func.isRequired,
};


export default withTranslation()(withStyles(SpamDonut, styles));
