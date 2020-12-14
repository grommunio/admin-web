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
import grey from '../colors/grey';
import red from '../colors/red';
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

class CPUPieChart extends Component {

  formatLastCPU(unformatted) {
    return [
      { name: 'user', value: unformatted.user, color: green['500'] },
      { name: 'system', value: unformatted.system, color: red['500'] },
      { name: 'io', value: unformatted.io, color: grey['500'] },
      { name: 'steal', value: unformatted.steal, color: blue['500'] },
      { name: 'interrupt', value: unformatted.interrupt, color: orange['500'] },
      { name: 'idle', value: unformatted.idle, color: blue['800'] },
    ].filter(obj => obj.value !== 0);
  }

  CPUTooltip = props => {
    if (props.active && props.content && props.content._self) {
      const lastIndex =  props.content._self.props.cpuPercent.length - 1;
      const newPayload = [
        { name: 'Idle', value: props.content._self.props.cpuPercent[lastIndex].idle + '%' },
        { name: 'User', value: props.content._self.props.cpuPercent[lastIndex].user + '%' },
        { name: 'System', value: props.content._self.props.cpuPercent[lastIndex].system + '%' },
        { name: 'IO', value: props.content._self.props.cpuPercent[lastIndex].io + '%' },
        { name: 'Steal', value: props.content._self.props.cpuPercent[lastIndex].steal + '%' },
        { name: 'Interrupt', value: props.content._self.props.cpuPercent[lastIndex].interrupt + '%' },
      ];
      return <DefaultTooltipContent
        {...props}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  render() {
    const { classes, cpuPercent } = this.props;
    const lastCpu = cpuPercent.length > 0 ? this.formatLastCPU(cpuPercent[cpuPercent.length -1]) : [];

    return (
      <div>
        <Typography className={classes.chartTitle} variant="h5">
          {cpuPercent.length > 0 && `CPU: ${(100 - cpuPercent[cpuPercent.length - 1].idle).toFixed(1)}%`}
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart height={250}>
            <Pie
              data={lastCpu}
              dataKey="value"
              nameKey="name"
              startAngle={180}
              endAngle={-180}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill={green['500']}
              label
              minAngle={1}
              isAnimationActive={false}
            >
              {lastCpu.map((entry, index) =>
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              )}
            </Pie>
            <Tooltip
              isAnimationActive={false}
              content={<this.CPUTooltip />}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

CPUPieChart.propTypes = {
  classes: PropTypes.object.isRequired,
  cpuPercent: PropTypes.array.isRequired,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(CPUPieChart)));
