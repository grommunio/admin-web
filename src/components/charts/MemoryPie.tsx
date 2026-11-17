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

function MemoryPie() {
  const { classes } = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const { memoryPie } = useAppSelector(state => state.dashboard.Dashboard);
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
            toolbar: { show: false },
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
          legend: {
            position: 'bottom',
            width: 268,
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
          colors: ['#546E7A', '#b83e6a', '#e0a458', '#5cb85c'],
        }
        }
        series={memoryPie.values}
        type="pie"
        width={268}
      />
    </div>
  );
}


export default MemoryPie;
