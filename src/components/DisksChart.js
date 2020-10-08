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
import green from '../colors/green';
import orange from '../colors/orange';
import red from '../colors/red';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';

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

  DiskTooltip = props => {
    if (props.active && props.content && props.content._self) {
      const newPayload = [
        { name: 'Percentage', value: props.payload[0].payload.percent },
        { name: 'Device', value: props.payload[0].payload.device },
        { name: 'Filesystem', value: props.payload[0].payload.filesystem },
      ];
      return <DefaultTooltipContent
        {...props}
        payload={newPayload}
      />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  formatTick = value => {
    return this.formatLabel(value, 0);
  }

  formatMB = value => (value / 1000000).toFixed(0) + 'MB';

  render() {
    const { classes, t, disks } = this.props;
    return (
      <div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={disks}
            layout="vertical"
            margin={{ top: 0, right: 32, left: 40, bottom: 4 }}
          >
            <YAxis type="category" dataKey="mountpoint" />
            <XAxis type="number"/>
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
                  fill={entry.percent > 90 ? red['500'] : entry.percent > 80 ? orange['500'] : green['500']}
                />
              )}
              <LabelList
                dataKey="insideLabel"
                position="insideRight"
                style={{ fill: 'black' }}
              />
              <LabelList
                dataKey="outsideLabel"
                position="right"
                style={{ fill: 'black' }}
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
  t: PropTypes.func.isRequired,
  disks: PropTypes.array.isRequired,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(MemoryChart)));