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
import blue from '../colors/blue';
import green from '../colors/green';
import orange from '../colors/orange';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  chartTitle: {
    margin: theme.spacing(2, 3),
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
      <div>
        <Typography className={classes.chartTitle} variant="h5">
          {memory.length > 0 && `Memory: ${memory[memory.length - 1].percent}%`}
        </Typography>
        <ResponsiveContainer width="100%" height={250} >
          <AreaChart
            data={memory}
            margin={{ top: 0, right: 32, left: 10, bottom: 16 }}
            stackOffset="expand"
          >
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
              dataKey="total"
              fill={blue['800']}
              stroke={blue['800']}
              fillOpacity={0.8}
              isAnimationActive={false}
            /> 
            <Area
              strokeWidth={2}
              type="monotone"
              dataKey="free"
              fill={blue['800']}
              stroke={blue['800']}
              fillOpacity={0.8}
              isAnimationActive={false}
            />
            <Area
              strokeWidth={2}
              type="monotone"
              dataKey="used"
              fill={green['500']}
              stroke={green['500']}
              fillOpacity={0.8}
              isAnimationActive={false}
            />
            <Area
              strokeWidth={2}
              type="monotone"
              dataKey="cache"
              fill={orange['500']}
              stroke={orange['500']}
              fillOpacity={0.8}
              isAnimationActive={false}
            />
            <Area
              strokeWidth={2}
              type="monotone"
              dataKey="buffer"
              fill={blue['500']}
              stroke={blue['500']}
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