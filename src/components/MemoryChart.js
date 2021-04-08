// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  root: {
    flex: 1,
    width: 0,
  },
  chartTitle: {
    margin: theme.spacing(2),
    visibility: 'hidden',
  },
});

class MemoryChart extends Component {

  formatLabel(value, descimals) {
    if (value > 1000000000) return (value / 1000000000).toFixed(descimals) + 'GB';
    if (value > 1000000) return (value / 1000000).toFixed(descimals) + 'MB';
    if (value > 1000) return (value / 1000).toFixed(descimals) + 'KB';
    return value + 'B';
  }

  formatTick = value => {
    return this.formatLabel(value, 0);
  }

  formatMB = value => (value / 1000000).toFixed(0) + 'MB';

  render() {
    const { classes, memory } = this.props;
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
              tickFormatter={this.formatTick}
            />
            <Tooltip
              formatter={this.formatMB}
              isAnimationActive={false}
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
}

MemoryChart.propTypes = {
  classes: PropTypes.object.isRequired,
  memory: PropTypes.array.isRequired,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(MemoryChart)));
