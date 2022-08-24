// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import notActivatedLicense from '../res/notActivatedLicense.svg';
import activatedLicense from '../res/activatedLicense.svg';
import { withStyles } from '@mui/styles';
import { Box } from '@mui/system';

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  licenseIcon: {
    cursor: 'pointer',
  },
  box: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderRadius: 32,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
};

function LicenseIcon({ classes, activated, handleNavigation }) {

  return (
    <div className={classes.root}>
      <Box className={classes.box}>
        <img
          className={classes.licenseIcon}
          src={activated ? activatedLicense : notActivatedLicense}
          width={32}
          height={25}
          onClick={handleNavigation('license')}
        />
      </Box>
    </div>
  );
}

LicenseIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  activated: PropTypes.bool,
  handleNavigation: PropTypes.func.isRequired,
};

export default withStyles(styles)(LicenseIcon);
