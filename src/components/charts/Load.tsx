// SPDX-License-Identifier: AGPL-3.0-or-later 
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH
import React, { useCallback } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Paper, Theme, Typography, useTheme } from '@mui/material';
import Chart from "react-apexcharts";
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store';

const useStyles = makeStyles()((theme: Theme) => ({
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
}));

function Load() {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { load } = useAppSelector(state => state.dashboard);
  const theme = useTheme();

  const formatValue = useCallback((value: number) => {
    return Number(value).toFixed(2);
  }, []);

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
                borderRadius: 4,
                horizontal: true,
                barHeight: '60%',
                distributed: true,
              }
            },
            dataLabels: {
              formatter: formatValue,
            },
            legend: {
              show: false,
            },
            xaxis: {
              axisBorder: {
                show: false
              },
              labels: {
                style: {
                  colors: theme.palette.text.primary,
                },
              },
              categories: [t("1 Min"), t("5 Mins"), t("15 Mins")],
              tickAmount: 4,
              min: 0,
            },
            yaxis: {
              labels: {
                style: {
                  colors: theme.palette.text.primary,
                },
              },
            },
            tooltip: {
              y: {
                formatter: formatValue,
                title: {
                  formatter: () => "",
                }
              },
            },
            colors: ['#2E93fA', '#546E7A', '#E91E63', '#FF9800', '#8e9eab', '#66DA26'],
          }}
          series={[{
            data: load
          }]}
          type="bar"
          height={200}
          width="95%"
          align="right"
        />
      </div>
    </Paper>
  );
}
export default Load;
