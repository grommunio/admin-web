// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Typography } from '@mui/material';


const circleStyle = {
  height: 16,
  width: 16,
  margin: 4,
  backgroundColor: "#66bb6a",
  borderRadius: 8,
};

const useStyles = makeStyles()({
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 16,
  },
  redDot: {
    ...circleStyle,
    backgroundColor: '#d32f2f',
  },
  greenDot: {
    ...circleStyle,
    backgroundColor: "#66bb6a",
  },
  yellowDot: {
    ...circleStyle,
    backgroundColor: "#ffa726",
  },
  blueDot: {
    ...circleStyle,
    backgroundColor: "#29b6f6"
  }
});

function DNSLegend() {
  const { classes } = useStyles();
  return <div className={classes.flexRow}>
    <div className={classes.greenDot}></div><Typography sx={{mr: 1}}>OK</Typography>
    <div className={classes.redDot}></div><Typography sx={{mr: 1}}>Required</Typography>
    <div className={classes.yellowDot}></div><Typography sx={{mr: 1}}>Recommended</Typography>
    <div className={classes.blueDot}></div><Typography>Optional</Typography>
    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', marginLeft: 8 }}>
      <Typography variant="caption">Please note: Depending on your environment and DNS configuration some recommendations may vary</Typography>
    </div>
    
  </div>
}


export default DNSLegend;