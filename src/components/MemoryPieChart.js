// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { Component } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import green from '../colors/green';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';
import { Typography } from '@mui/material';

const styles = theme => ({
  chartTitle: {
    margin: theme.spacing(2, 2, 2, 2),
  },
});

class MemoryPieChart extends Component {

  formatMB = value => (value / 1000000).toFixed(0) + 'MB';

  MemoryTooltip = props => {
    if (props.active && props.content && props.content._self) {
      const lastIndex =  props.content._self.props.memory.length - 1;
      const newPayload = [
        { name: 'Free', value: this.formatMB(props.content._self.props.memory[lastIndex].free) },
        { name: 'Used', value: this.formatMB(props.content._self.props.memory[lastIndex].used) },
        { name: 'Cache', value: this.formatMB(props.content._self.props.memory[lastIndex].cache) },
        { name: 'Buffer', value: this.formatMB(props.content._self.props.memory[lastIndex].buffer) },
      ];
      return <DefaultTooltipContent
        {...props}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  formatRamLabel(value) {
    if (value > 1000000000) return (value / 1000000000).toFixed(1) + 'GB';
    if (value > 1000000) return (value / 1000000).toFixed(0) + 'MB';
    if (value > 1000) return (value / 1000).toFixed(0) + 'KB';
    return value + 'B';
  }

  formatLabel(value, descimals) {
    if (value > 1000000000) return (value / 1000000000).toFixed(descimals) + 'GB';
    if (value > 1000000) return (value / 1000000).toFixed(descimals) + 'MB';
    if (value > 1000) return (value / 1000).toFixed(descimals) + 'KB';
    return value + 'B';
  }

  formatLastMemory(unformatted) {
    return [
      { name: 'free', value: unformatted.free, color: "gradientBlue" },
      { name: 'used', value: unformatted.used, color: "gradientGreen" },
      { name: 'cache', value: unformatted.cache, color: "gradientOrange" },
      { name: 'buffer', value: unformatted.buffer, color: "gradientGrey" },
    ];
  }

  render() {
    const { classes, memory } = this.props;
    const lastMemory = memory.length > 0 ? this.formatLastMemory(memory[memory.length - 1]) : [];

    return (
      <div>
        <Typography className={classes.chartTitle}>
          {memory.length > 0 && `Memory: ${memory[memory.length - 1].percent}%`}
        </Typography>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart height={150}>
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
                <stop offset="5%" stopColor={"#ED8F03"} stopOpacity={1}/>
                <stop offset="95%" stopColor={"#FFB75E"} stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="gradientGrey" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={"#8e9eab"} stopOpacity={1}/>
                <stop offset="95%" stopColor={"#eef2f3"} stopOpacity={1}/>
              </linearGradient>
            </defs>
            <Pie
              data={lastMemory}
              dataKey="value"
              nameKey="name"
              startAngle={180}
              endAngle={540}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              fill={green['500']}
              stroke={"none"}
              label={data => this.formatLabel(data.payload.value)}
              isAnimationActive={false}
              margin={{ top: 0, right: 32, left: 10, bottom: 16 }}
            >
              {lastMemory.map((entry, index) => 
                <Cell
                  className={classes.test}
                  key={`cell-${index}`}
                  fill={`url(#${entry.color})`}
                />
              )}
            </Pie>
            <Tooltip
              formatter={this.formatLabel}
              isAnimationActive={true}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

MemoryPieChart.propTypes = {
  classes: PropTypes.object.isRequired,
  memory: PropTypes.array.isRequired,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(MemoryPieChart)));
