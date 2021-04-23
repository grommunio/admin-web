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
  BarChart,
  Bar,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import orange from '../colors/orange';
import red from '../colors/red';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';

const styles = theme => ({
  root: {
    flex: 1,
    width: 0,
  },
  chartTitle: {
    margin: theme.spacing(2),
  },
});

class MemoryChart extends Component {

  formatLabel(value, descimals) {
    if (value > 1000000000) return (value / 1000000000).toFixed(descimals) + 'GB';
    if (value > 1000000) return (value / 1000000).toFixed(descimals) + 'MB';
    if (value > 1000) return (value / 1000).toFixed(descimals) + 'KB';
    return value + 'B';
  }

  DiskTooltip = props => {
    if (props && props.payload && props.payload.length > 0) {
      const newPayload = [
        { name: 'Percentage', value: props.payload[0].payload.percent },
        { name: 'Device', value: props.payload[0].payload.device },
        { name: 'Filesystem', value: props.payload[0].payload.filesystem },
      ];
      return <DefaultTooltipContent
        labelStyle={{ color: 'black', fontSize: 18, paddingBottom: 4 }}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  render() {
    const { classes, disks } = this.props;
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
              content={<this.DiskTooltip />}
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
}

MemoryChart.propTypes = {
  classes: PropTypes.object.isRequired,
  disks: PropTypes.array.isRequired,
};


export default connect(null, null)(
  withTranslation()(withStyles(styles)(MemoryChart)));
