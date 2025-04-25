// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import Chart from "react-apexcharts";
import { withTranslation } from 'react-i18next';
import { withTheme } from '@emotion/react';

const shouldComponentUpdate = (_prevProps, nextProps) => {
  return nextProps.timer % 10 !== 0;
}

function Disks(props) {

  const formatYAxis = (value) => {
    return value + '%';
  };
  
  const { disks, t, theme } = props;
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
              borderRadius: 8,
              columnWidth: '60%',
              distributed: true,
              dataLabels: {
                orientation: "vertical",
              },
            },
          },
          dataLabels: {
            enabled: true,
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
            tickAmount: 4,
            max: 100,
            min: 0,
          },
          xaxis: {
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            },
            labels: {
              rotate: 0,
              hideOverlappingLabels: true,
              trim: true,
              style: {
                colors: theme.palette.text.primary,
                fontSize: '10px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 400,
                cssClass: 'apexcharts-xaxis-label',
              },
            },
            categories: disks.map(d => d.mountpoint)
          },
          tooltip: {
            y: {
              formatter: function(value, { dataPointIndex: i }) {
                const { percent, filesystem, device } = disks[i];
                return percent + '% on ' + device + " (" + filesystem + ")"
              },
              title: {
                formatter: () => "",
              }
            },
            style: {
              color: '#000',
            },
          },
          colors: ['#2E93fA', '#546E7A', '#E91E63', '#FF9800', '#8e9eab', '#66DA26'],
        }}
        series={[{
          data: disks.map(d => d.percent)
        }]}
        type="bar"
        height={200}
      />
    </div>
  );
}

Disks.propTypes = {
  disks: PropTypes.array.isRequired,
  timer: PropTypes.number,
  t: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
};

const MemorizedDisk = memo(Disks, shouldComponentUpdate);

export default withTheme(withTranslation()(MemorizedDisk));
