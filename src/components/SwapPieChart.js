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
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';

const styles = theme => ({
  chartTitle: {
    margin: theme.spacing(2, 3),
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
    const { classes, t, swap } = this.props;


    console.log(swap);
    return (
      <div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart height={250}>
            <Pie
              data={swap}
              dataKey="value"
              nameKey="name"
              startAngle={180}
              endAngle={-180}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill={green['500']}
              label={data => this.formatLabel(data.payload.value)}
              isAnimationActive={false}
            >
              {swap.map((entry, index) => 
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              )}
            </Pie>
            {swap.length > 0 && swap[1].value && <Tooltip
              formatter={this.formatLabel}
              isAnimationActive={false}
              content={<this.SwapTooltip />}
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
  t: PropTypes.func.isRequired,
  swap: PropTypes.array.isRequired,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(SwapPieChart)));