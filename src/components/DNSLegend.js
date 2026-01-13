// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { Typography } from '@mui/material';

const styles = {
  flexRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 16,
  },
  redDot: {
    height: 16,
    width: 16,
    margin: 4,
    backgroundColor: '#d32f2f',
    borderRadius: 8,
  },
  greenDot: {
    height: 16,
    width: 16,
    margin: 4,
    backgroundColor: "#66bb6a",
    borderRadius: 8,
  },
  yellowDot: {
    height: 16,
    width: 16,
    margin: 4,
    backgroundColor: "#ffa726",
    borderRadius: 8,
  },
  blueDot: {
    height: 16,
    width: 16,
    margin: 4,
    backgroundColor: "#29b6f6",
    borderRadius: 8,
  }
};

function DNSLegend({ classes }) {
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

DNSLegend.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(DNSLegend, styles);