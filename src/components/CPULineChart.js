// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { Component } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
} from 'recharts';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';
import { Typography } from '@mui/material';

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

class CPULineChart extends Component {

  CPUTooltip = props => {
    if (props && props.payload && props.payload.length > 0) {
      const newPayload = [
        { name: 'User', value: props.payload[0].payload.user + "%" },
        { name: 'System', value: props.payload[0].payload.system + "%" },
        { name: 'IO', value: props.payload[0].payload.io + "%" },
        { name: 'Steal', value: props.payload[0].payload.steal + "%" },
        { name: 'Interrupt', value: props.payload[0].payload.interrupt + "%" },
        { name: 'Idle', value: props.payload[0].payload.idle + "%" },
      ];
      return <DefaultTooltipContent
        labelStyle={{ color: 'black', fontSize: 18, paddingBottom: 4 }}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  render() {
    const { classes, cpuPercent } = this.props;

    return (
      <div className={classes.root}>
        <Typography className={classes.chartTitle}>
          {cpuPercent.length > 0 && `CPU: ${(100 - cpuPercent[cpuPercent.length - 1].idle).toFixed(1)}%`}
        </Typography>
        <ResponsiveContainer width="100%" height={180} >
          <LineChart
            data={cpuPercent}
            margin={{ top: 0, right: 32, left: 10, bottom: 16 }}
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
            </defs>
            <XAxis dataKey="usage" />
            <YAxis domain={[0, 100]}/>
            <Tooltip 
              isAnimationActive={false}
              content={<this.CPUTooltip />}
            />
            <Legend />
            <Line
              strokeWidth={4}
              type="monotone"
              dataKey="user"
              stroke={"url(#gradientGreen)"}
              isAnimationActive={false}
            />
            <Line
              strokeWidth={4}
              type="monotone"
              dataKey="system"
              stroke={"url(#gradientRed)"}
              isAnimationActive={false}
            />
            <Line
              strokeWidth={4}
              type="monotone"
              dataKey="io"
              stroke={"url(#gradientBlue)"}
              isAnimationActive={false}
            />
            <Line
              strokeWidth={4}
              type="monotone"
              dataKey="steal"
              stroke={"url(#gradientBlue)"}
              isAnimationActive={false}
            />
            <Line
              strokeWidth={4}
              type="monotone"
              dataKey="interrupt"
              stroke={"url(#gradientOrange)"}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

CPULineChart.propTypes = {
  classes: PropTypes.object.isRequired,
  cpuPercent: PropTypes.array.isRequired,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(CPULineChart)));
