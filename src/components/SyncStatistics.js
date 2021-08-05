// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Typography} from '@material-ui/core';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Devices, Notifications, Person, Router, TapAndPlay } from '@material-ui/icons';

const styles = theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  flexItem: {
    flex: 1,
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  icon: {
    flex: 1,
    color: '#777',
    position: 'relative',
    bottom: 12,
    height: 28,
  },
  labeledData: {
    flex: 4,
  },
  data: {
    fontSize: 32,
    fontWeight: 600,
    lineHeight: 1.1,
    margin: theme.spacing(1, 0, 1, 0),
  },
  label: {
    color: '#777',
  },
});

class SyncStatistics extends PureComponent {

  render() {
    const {classes, t, data} = this.props;
    const openConnections = data.length || 0;
    const pushConnections = data.filter(e => e.push).length || 0;
    const users = new Set(data.map(e => e.user)).size || 0;
    const devices = new Set(data.map(e => e.devid)).size || 0;
    const hosts = new Set(data.map(e => e.ip)).size || 0;

    return (
      <div className={classes.root}>
        <div className={classes.flexItem}>
          <Paper className={classes.paper}>
            <TapAndPlay className={classes.icon}/>
            <div className={classes.labeledData}>
              <Typography className={classes.data}>{openConnections}</Typography>
              <Typography className={classes.label}>{t("Open connections")}</Typography>
            </div>
          </Paper>
        </div>
        <div className={classes.flexItem}>
          <Paper className={classes.paper}>
            <Notifications className={classes.icon}/>
            <div className={classes.labeledData}>
              <Typography className={classes.data}>{pushConnections}</Typography>
              <Typography className={classes.label}>{t("Push connections")}</Typography>
            </div>
          </Paper>
        </div>
        <div className={classes.flexItem}>
          <Paper className={classes.paper}>
            <Person className={classes.icon}/>
            <div className={classes.labeledData}>
              <Typography className={classes.data}>{users}</Typography>
              <Typography className={classes.label}>{t("Users")}</Typography>
            </div>
          </Paper>
        </div>
        <div className={classes.flexItem}>
          <Paper className={classes.paper}>
            <Devices className={classes.icon}/>
            <div className={classes.labeledData}>
              <Typography className={classes.data}>{devices}</Typography>
              <Typography className={classes.label}>{t("Devices")}</Typography>
            </div>
          </Paper>
        </div>
        <div className={classes.flexItem}>
          <Paper className={classes.paper}>
            <Router className={classes.icon}/>
            <div className={classes.labeledData}>
              <Typography className={classes.data}>{hosts}</Typography>
              <Typography className={classes.label}>{t("Hosts")}</Typography>
            </div>
          </Paper>
        </div>
      </div>
    );
  }
}

SyncStatistics.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
};

export default connect(null, null)(
  withTranslation()(withStyles(styles)(SyncStatistics)));
