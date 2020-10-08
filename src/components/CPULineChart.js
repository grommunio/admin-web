import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
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
import grey from '../colors/grey';
import red from '../colors/red';
import green from '../colors/green';
import blue from '../colors/blue';
import orange from '../colors/orange';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';

const styles = theme => ({
  chartTitle: {
    margin: theme.spacing(2, 3),
  },
});

class CPULineChart extends Component {

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
    const { classes, t, cpuPercent } = this.props;
    const lastCpu = cpuPercent.length > 0 ? this.formatLastCPU(cpuPercent[cpuPercent.length -1]) : [];

    return (
      <div>
        <ResponsiveContainer width="100%" height={250} >
          <LineChart
            data={cpuPercent}
            margin={{ top: 0, right: 32, left: 10, bottom: 16 }}
          >
            <XAxis dataKey="usage" />
            <YAxis domain={[0, 100]}/>
            <Tooltip 
              isAnimationActive={false}
            />
            <Legend />
            <Line
              strokeWidth={4}
              type="monotone"
              dataKey="user"
              stroke={green['500']}
              isAnimationActive={false}
            />
            <Line
              strokeWidth={4}
              type="monotone"
              dataKey="system"
              stroke={red['500']}
              isAnimationActive={false}
            />
            <Line
              strokeWidth={4}
              type="monotone"
              dataKey="io"
              stroke={blue['800']}
              isAnimationActive={false}
            />
            <Line
              strokeWidth={4}
              type="monotone"
              dataKey="steal"
              stroke={blue['500']}
              isAnimationActive={false}
            />
            <Line
              strokeWidth={4}
              type="monotone"
              dataKey="interupt"
              stroke={orange['500']}
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
  t: PropTypes.func.isRequired,
  cpuPercent: PropTypes.array.isRequired,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(CPULineChart)));