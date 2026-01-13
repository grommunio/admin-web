// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { withStyles } from 'tss-react/mui';
import { Paper, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import StorageIcon from '@mui/icons-material/Storage';

const styles = theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: '1fr 1fr',
    },
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
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
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.1,
    margin: theme.spacing(1, 0, 1, 0),
  },
  label: {
    color: '#777',
  },
});

const AntispamStatistics = props => {
  const formatBytes = (bytes) => {
    if (bytes > 10000) {
      return Math.round(bytes/1000) + "k";
    } 
    
    return bytes;
  }

  const {classes, t, data} = props;
  return (
    <div className={classes.root}>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <MailOutlineIcon className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{data.scanned}</Typography>
            <Typography className={classes.label}>{t("Scanned Mails")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <NotInterestedIcon className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{data.spamCount}</Typography>
            <Typography className={classes.label}>{t("Spam Count")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <PlaylistAddCheckIcon className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{data.learned}</Typography>
            <Typography className={classes.label}>{t("Learned")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <StorageIcon className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{formatBytes(data.bytesAllocated)}</Typography>
            <Typography className={classes.label}>{t("Bytes allocated")}</Typography>
          </div>
        </Paper>
      </div>
    </div>
  );
}

AntispamStatistics.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};

export default withTranslation()(withStyles(AntispamStatistics, styles));
