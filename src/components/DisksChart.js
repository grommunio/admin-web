// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import {
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import orange from '../colors/orange';
import red from '../colors/red';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';

const styles = theme => ({
  root: {
    flex: 1,
    width: 0,
  },
  chartTitle: {
    margin: theme.spacing(2, 2, 2, 2),
  },
});

function MemoryChart(props) {
  const { classes, disks } = props;

  const DiskTooltip = tooltipProps => {
    if (tooltipProps && tooltipProps.payload && tooltipProps.payload.length > 0) {
      const { percent, device, filesystem } = tooltipProps.payload[0].payload;
      const newPayload = [
        { name: 'Percentage', value: percent },
        { name: 'Device', value: device },
        { name: 'Filesystem', value: filesystem },
      ];
      return <DefaultTooltipContent
        labelStyle={{ color: 'black', fontSize: 18, paddingBottom: 4 }}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...tooltipProps} />;
  };

  return (
    <div className={classes.root}>
      <Typography className={classes.chartTitle}>Disks</Typography>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={disks}
          margin={{ top: 0, right: 32, left: 40, bottom: 4 }}
        >
          <defs>
            <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={"#56ab2f"} stopOpacity={1}/>
              <stop offset="95%" stopColor={"#a8e063"} stopOpacity={1}/>
            </linearGradient>
          </defs>
          <XAxis type="category" dataKey="mountpoint" tick={{ fontSize: 12, wordBreak: 'break-all' }}/>
          <YAxis type="number"/>
          <Tooltip
            isAnimationActive={false}
            content={<DiskTooltip />}
          />
          <Bar
            dataKey="percent"
            stackId="a"
            isAnimationActive={false}
          >
            {disks.map((entry, index) =>
              <Cell
                key={`cell-${index}`}
                fill={entry.percent > 90 ? red['500'] : entry.percent > 80 ? orange['500'] : "url(#gradientGreen)"}
              />
            )}
            <LabelList
              dataKey="label"
              position="insideBottom"
              angle={-90}
              offset={100}
              style={{ fill: "black", fontWeight: 500 }}
            />
          </Bar>
          <Bar
            dataKey="freePercent" 
            stackId="a"
            fill={"rgba(0, 0, 0, 0)"}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

MemoryChart.propTypes = {
  classes: PropTypes.object.isRequired,
  disks: PropTypes.array.isRequired,
};


export default withStyles(styles)(MemoryChart);
