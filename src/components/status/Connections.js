// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React from 'react';
import { withStyles } from '@mui/styles';
import { Paper, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Create, HourglassEmpty, Router, Scanner } from '@mui/icons-material';

const styles = theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  flexItem: {
    flex: 1,
  },
  paper: {
    padding: theme.spacing(2, 2, 2, 2),
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

const Connections = props => {
  const { classes, t, data } = props;

  return (
    <div className={classes.root}>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <Router className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{data.active}</Typography>
            <Typography className={classes.label}>{t("Active")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <Scanner className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{data.reading}</Typography>
            <Typography className={classes.label}>{t("Reading")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <Create className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{data.writing}</Typography>
            <Typography className={classes.label}>{t("Writing")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <HourglassEmpty className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{data.waiting}</Typography>
            <Typography className={classes.label}>{t("Waiting")}</Typography>
          </div>
        </Paper>
      </div>
    </div>
  );
}

Connections.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(Connections));
