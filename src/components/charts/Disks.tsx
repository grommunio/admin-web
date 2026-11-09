// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { memo } from 'react';
import { Typography, useTheme } from '@mui/material';
import Chart from "react-apexcharts";
import { useTranslation, withTranslation } from 'react-i18next';
import { withTheme } from '@emotion/react';
import { Disk } from '@/types/dashboard';


type DisksProps = {
  timer: number;
  disks: Disk[];
}

const shouldComponentUpdate = (_: Readonly<DisksProps>, nextProps: Readonly<DisksProps>) => {
  return nextProps.timer % 10 !== 0;
}

function Disks({ disks }: DisksProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const formatYAxis = (value: number) => {
    return value.toString();
  };
  const formatXAxis = (value: string) => {
    return value + '%';
  };
  
  return (
    <div style={{ flex: 1, width: 0 }}>
      <Typography style={{ margin: '8px 0 0 16px'}}>{t("Disks")}</Typography>
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
            },
          },
          dataLabels: {
            enabled: true,
            offsetX:5,
            style: {
              colors: [theme.palette.mode === 'light' ? '#000000' : '#ffffff']
            },
            formatter: function(_, { dataPointIndex: i }) {
              return (disks[i].used / 1000000000).toFixed(1) + "GB";
            },
          },
          legend: {
            show: false
          },
          yaxis: {
            labels: {
              formatter: formatYAxis,
              style: {
                colors: theme.palette.text.primary,
              },
            },
          },
          xaxis: {
            axisBorder: {
              show: false
            },
            labels: {
              rotate: 0,
              style: {
                colors: theme.palette.text.primary,
              },
              formatter: formatXAxis,
            },
            categories: disks.map(d => d.mountpoint),
            tickAmount: 4,
            max: 100,
            min: 0,
          },
          tooltip: {
            y: {
              formatter: function(_, { dataPointIndex: i }) {
                const { percent, filesystem, device } = disks[i];
                return percent + '% on ' + device + " (" + filesystem + ")"
              },
              title: {
                formatter: () => "",
              }
            },
          },
          colors: ['#5b8fd0', '#546E7A', '#b83e6a', '#e0a458', '#8e9eab', '#5cb85c'],
        }}
        series={[{
          data: disks.map(d => d.percent)
        }]}
        type="bar"
        height={200}
        width="95%"
        align="right"
      />
    </div>
  );
}

const MemorizedDisk = memo(Disks, shouldComponentUpdate);

export default withTheme(withTranslation()(MemorizedDisk));
