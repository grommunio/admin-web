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
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  CartesianGrid,
} from 'recharts';
import blue from '../colors/blue';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  chartTitle: {
    margin: theme.spacing(2, 3),
  },
});

class LoadChart extends Component {

  render() {
    const { classes, t, load } = this.props;
    return (
      <div>
        <Typography className={classes.chartTitle} variant="h5">{t("Load")}</Typography>
        <ResponsiveContainer width="100%" height={250} >
          <AreaChart data={load} margin={{ top: 0, right: 32, left: 10, bottom: 16 }}>
            <defs>
              <linearGradient id="colorG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={blue["600"]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={blue["500"]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Legend />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              fillOpacity={1}
              stroke={blue["900"]}
              fill="url(#colorG)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

LoadChart.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  load: PropTypes.array.isRequired,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(LoadChart)));
