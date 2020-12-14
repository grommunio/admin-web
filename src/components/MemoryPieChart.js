// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
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
import blue from '../colors/blue';
import orange from '../colors/orange';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  chartTitle: {
    margin: theme.spacing(2, 3),
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
      { name: 'free', value: unformatted.free, color: blue['800'] },
      { name: 'used', value: unformatted.used, color: green['500'] },
      { name: 'cache', value: unformatted.cache, color: orange['500'] },
      { name: 'buffer', value: unformatted.buffer, color: blue['500'] },
    ];
  }

  render() {
    const { classes, memory } = this.props;
    const lastMemory = memory.length > 0 ? this.formatLastMemory(memory[memory.length - 1]) : [];

    return (
      <div>
        <Typography className={classes.chartTitle} variant="h5">
          {memory.length > 0 && `Memory: ${memory[memory.length - 1].percent}%`}
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart height={250}>
            <Pie
              data={lastMemory}
              dataKey="value"
              nameKey="name"
              startAngle={180}
              endAngle={540}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill={green['500']}
              label={data => this.formatRamLabel(data.payload.value)}
              isAnimationActive={false}
            >
              {lastMemory.map((entry, index) => 
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              )}
            </Pie>
            <Tooltip
              formatter={this.formatLabel}
              isAnimationActive={false}
              content={<this.MemoryTooltip />}
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
