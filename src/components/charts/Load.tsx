// SPDX-License-Identifier: AGPL-3.0-or-later 
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH
import { useCallback } from 'react';
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
    backgroundColor: theme.palette.mode === 'light' ? '#f3f3f399' : '#121315aa',

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
              offsetX:5,
              style: {
                colors: [theme.palette.mode === 'light' ? '#000000' : '#ffffff']
              },
              dropShadow: {
                enabled: false,
              },
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
            colors: ['#5b8fd0', '#546E7A', '#b83e6a', '#e0a458', '#8e9eab', '#5cb85c'],
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
