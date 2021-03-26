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
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  chartTitle: {
    margin: theme.spacing(2),
  },
});

class SwapPieChart extends Component {

  SwapTooltip = props => {
    if (props.active && props.content && props.content._self) {
      const newPayload = [
        { name: 'Used', value: this.formatLabel(props.content._self.props.swap[0].value) },
        { name: 'Free', value: this.formatLabel(props.content._self.props.swap[1].value) },
      ];
      return <DefaultTooltipContent
        {...props}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  formatLabel(value, descimals) {
    if (value > 1000000000) return (value / 1000000000).toFixed(descimals) + 'GB';
    if (value > 1000000) return (value / 1000000).toFixed(descimals) + 'MB';
    if (value > 1000) return (value / 1000).toFixed(descimals) + 'KB';
    return value + 'B';
  }

  render() {
    const { classes, swap, swapPercent } = this.props;

    return (
      <div>
        <Typography className={classes.chartTitle}>
          Swap: {swap.length > 0 && swap[1].value ? swapPercent + '%' : 'None'}
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
                <stop offset="5%" stopColor={"#FFB75E"} stopOpacity={1}/>
                <stop offset="95%" stopColor={"#ED8F03"} stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="gradientGrey" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={"#8e9eab"} stopOpacity={1}/>
                <stop offset="95%" stopColor={"#eef2f3"} stopOpacity={1}/>
              </linearGradient>
            </defs>
            <Pie
              data={swap}
              dataKey="value"
              nameKey="name"
              startAngle={180}
              endAngle={-180}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              label={data => this.formatLabel(data.payload.value)}
              minAngle={1}
              stroke={"none"}
              isAnimationActive={false}
            >
              {swap.map((entry, index) => 
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#${entry.color})`}
                />
              )}
            </Pie>
            {swap.length > 0 && swap[1].value && <Tooltip
              formatter={this.formatLabel}
              isAnimationActive={true}
            />}
            {swap.length > 0 && swap[1].value && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

SwapPieChart.propTypes = {
  classes: PropTypes.object.isRequired,
  swap: PropTypes.array.isRequired,
  swapPercent: PropTypes.number,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(SwapPieChart)));
