/* eslint-disable no-undef */
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import { withStyles } from '@mui/styles';
import { Paper, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import StorageIcon from '@mui/icons-material/Storage';
import { connect } from 'react-redux';
import { Dashboard, Outlet, Power } from '@mui/icons-material';
import { withTranslation } from 'react-i18next';

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
    fontWeight: 600,
    lineHeight: 1.1,
    margin: theme.spacing(1, 0, 1, 0),
  },
  label: {
    color: '#777',
  },
});

const About = props => {

  const formatBytes = (bytes) => {
    if (bytes > 10000) {
      return Math.round(bytes/1000) + "k";
    } 
    
    return bytes;
  }

  const { classes, t, about } = props;
  const { API, backend, schema } = about;
  return (
    <div className={classes.root}>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <Dashboard className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{process.env.REACT_APP_BUILD_VERSION}</Typography>
            <Typography className={classes.label}>{t("Web UI")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <Power className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{API}</Typography>
            <Typography className={classes.label}>{t("API")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <Outlet className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{backend}</Typography>
            <Typography className={classes.label}>{t("Backend")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <StorageIcon className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{formatBytes(schema)}</Typography>
            <Typography className={classes.label}>{t("Database")}</Typography>
          </div>
        </Paper>
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    about: state.about,
  };
};


About.propTypes = {
  classes: PropTypes.object.isRequired,
  about: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(connect(mapStateToProps)(withStyles(styles)(About)));
