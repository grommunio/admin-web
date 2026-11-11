// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { makeStyles } from 'tss-react/mui';
import Chart from "react-apexcharts";
import { useTranslation } from 'react-i18next';
import { Theme, useTheme } from '@mui/material';
import { useAppSelector } from '../../store';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    flex: 1,
    width: 0,
  },
  chartTitle: {
    margin: theme.spacing(2),
  },
}));


function CPUPie() {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { cpuPie }  = useAppSelector(state => state.dashboard.Dashboard);
  const theme = useTheme();
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
              easing: 'easeInOutSine',
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
          stroke: {
            show: false,
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
              colors: ['#ffffff'],          
            },
            dropShadow: {
              enabled: false,
            },
            background: {
              borderRadius: 3,
              borderWidth: 0,
              opacity: 0.8,
              enabled: true,
              dropShadow: {
                enabled: true,
              },
              foreColor: '#000000',
            },
          },
          legend: {
            position: 'bottom',
            width: 260,
            labels: {
              colors: theme.palette.text.primary,
            },
            markers: {
              size: 6,       
              strokeWidth: 0,
              offsetX: -2,
            },
            itemMargin: {
              horizontal: 6,    // space between whole legend items (icon+text pairs)
            },
          },
          tooltip: {
            enabled: false,
          },
          colors: ['#5b8fd0', '#546E7A', '#e0a458', '#8e9eab', '#b83e6a', '#5cb85c'],
        }}
        series={cpuPie.values}
        type="pie"
        width={268}
      />
    </div>
  );
}


export default CPUPie;
