// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Typography} from '@material-ui/core';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import StorageIcon from '@material-ui/icons/Storage';

const styles = theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
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

class AntispamStatistics extends Component {

  formatBytes = (bytes) => {
    if (bytes > 10000) {
      return Math.round(bytes/1000) + "k";
    } 
    
    return bytes;
  }

  render() {
    const {classes, data} = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.flexItem}>
          <Paper className={classes.paper}>
            <MailOutlineIcon className={classes.icon}/>
            <div className={classes.labeledData}>
              <Typography className={classes.data}>{data.scanned}</Typography>
              <Typography className={classes.label}>Scanned Mails</Typography>
            </div>
          </Paper>
        </div>
        <div className={classes.flexItem}>
          <Paper className={classes.paper}>
            <NotInterestedIcon className={classes.icon}/>
            <div className={classes.labeledData}>
              <Typography className={classes.data}>{data.spamCount}</Typography>
              <Typography className={classes.label}>Spam Count</Typography>
            </div>
          </Paper>
        </div>
        <div className={classes.flexItem}>
          <Paper className={classes.paper}>
            <PlaylistAddCheckIcon className={classes.icon}/>
            <div className={classes.labeledData}>
              <Typography className={classes.data}>{data.learned}</Typography>
              <Typography className={classes.label}>Learned</Typography>
            </div>
          </Paper>
        </div>
        <div className={classes.flexItem}>
          <Paper className={classes.paper}>
            <StorageIcon className={classes.icon}/>
            <div className={classes.labeledData}>
              <Typography className={classes.data}>{this.formatBytes(data.bytesAllocated)}</Typography>
              <Typography className={classes.label}>Bytes allocated</Typography>
            </div>
          </Paper>
        </div>
      </div>
    );
  }
}

AntispamStatistics.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};

export default withTranslation()(withStyles(styles)(AntispamStatistics));
