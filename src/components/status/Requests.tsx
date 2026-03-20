// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Paper, Theme, Typography} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CallReceived, CheckCircle, Functions } from '@mui/icons-material';
import { Connections } from '@/types/status';


const useStyles = makeStyles()((theme: Theme) => ({
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
}));

type RequestsProps = {
  data: Connections;
}

const Requests = (props: RequestsProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { data } = props;

  return (
    <div className={classes.root}>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <CheckCircle className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{data.accepted}</Typography>
            <Typography className={classes.label}>{t("Accepted")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <CallReceived className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{data.handled}</Typography>
            <Typography className={classes.label}>{t("Handled")}</Typography>
          </div>
        </Paper>
      </div>
      <div className={classes.flexItem}>
        <Paper className={classes.paper}>
          <Functions className={classes.icon}/>
          <div className={classes.labeledData}>
            <Typography className={classes.data}>{data.requests}</Typography>
            <Typography className={classes.label}>{t("Total")}</Typography>
          </div>
        </Paper>
      </div>
    </div>
  );
}


export default Requests;
