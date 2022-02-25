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
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';

const styles = theme => ({
  root: {
    flex: 1,
    width: 0,
  },
  chartTitle: {
    margin: theme.spacing(2, 2, 2, 2),
    visibility: 'hidden',
  },
});

function MemoryChart(props) {
  const { classes, memory } = props;

  const formatLabel = (value, descimals) => {
    if (value > 1000000000) return (value / 1000000000).toFixed(descimals) + 'GB';
    if (value > 1000000) return (value / 1000000).toFixed(descimals) + 'MB';
    if (value > 1000) return (value / 1000).toFixed(descimals) + 'KB';
    return value + 'B';
  };

  const formatTick = value => formatLabel(value, 0);

  const formatMB = value => (value / 1000000).toFixed(0) + 'MB';

  const TooltipContent = tooltipProps => {
    if (tooltipProps && tooltipProps.payload && tooltipProps.payload.length > 0) {
      const { used, cache, buffer, free } = tooltipProps.payload[0].payload;
      const newPayload = [
        { name: 'Used', value: formatLabel(used, 2) },
        { name: 'Cache', value: formatLabel(cache, 2) },
        { name: 'Buffer', value: formatLabel(buffer, 2) },
        { name: 'Free', value: formatLabel(free, 2) },
      ];
      return <DefaultTooltipContent
        labelStyle={{ color: 'black', fontSize: 18, paddingBottom: 4 }}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

    
  return (
    <div className={classes.root}>
      <Typography className={classes.chartTitle}>
        {memory.length > 0 && `Memory: ${memory[memory.length - 1].percent}%`}
      </Typography>
      <ResponsiveContainer width="100%" height={180} >
        <AreaChart
          data={memory}
          margin={{ top: 0, right: 32, left: 10, bottom: 16 }}
          stackOffset="expand"
        >
          <defs>
            <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={"#56ab2f"} stopOpacity={1}/>
              <stop offset="95%" stopColor={"#a8e063"} stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={"#2980B9"} stopOpacity={1}/>
              <stop offset="95%" stopColor={"#6DD5FA"} stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="gradientOrange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={"#FFB75E"} stopOpacity={1}/>
              <stop offset="95%" stopColor={"#ED8F03"} stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="gradientGrey" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={"#8e9eab"} stopOpacity={1}/>
              <stop offset="95%" stopColor={"#eef2f3"} stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="gradientRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={"#FF512F"} stopOpacity={1}/>
              <stop offset="95%" stopColor={"#DD2476"} stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="gradientGrey" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={"#8e9eab"} stopOpacity={1}/>
              <stop offset="95%" stopColor={"#eef2f3"} stopOpacity={1}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" />
          <YAxis
            type="number"
            domain={[0, memory[0] ? memory[0].total : 0]}
            tickFormatter={formatTick}
          />
          <Tooltip
            formatter={formatMB}
            isAnimationActive={false}
            content={<TooltipContent />}
          />
          <Legend />
          <Area
            strokeWidth={2}
            type="monotone"
            dataKey="used"
            fill={"url(#gradientGreen)"}
            stroke={"url(#gradientGreen)"}
            fillOpacity={0.8}
            isAnimationActive={false}
          />
          <Area
            strokeWidth={2}
            type="monotone"
            dataKey="cache"
            fill={"url(#gradientOrange)"}
            stroke={"url(#gradientOrange)"}
            fillOpacity={0.8}
            isAnimationActive={false}
          />
          <Area
            strokeWidth={2}
            type="monotone"
            dataKey="buffer"
            fill={"url(#gradientGrey)"}
            stroke={"url(#gradientGrey)"}
            fillOpacity={0.8}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

MemoryChart.propTypes = {
  classes: PropTypes.object.isRequired,
  memory: PropTypes.array.isRequired,
};

export default withStyles(styles)(MemoryChart);
