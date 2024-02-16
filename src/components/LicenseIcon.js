// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import notActivatedLicense from '../res/notActivatedLicense.svg';
import activatedLicense from '../res/activatedLicense.svg';
import { withStyles } from '@mui/styles';
import { Box } from '@mui/system';
import { useSelector } from 'react-redux';
import { Tooltip } from '@mui/material';
import { withTranslation } from 'react-i18next';

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
    marginRight: 8,
    cursor: 'pointer',
  },
};

function LicenseIcon({ classes, t }) {
  const license = useSelector(state => state.license);
  const activated = license.product && license.product !== "Community"

  return (
    <div className={classes.root}>
      <Box className={classes.box}>
        <Tooltip title={t(activated ? "Licensed" : "Unlicensed")}>
          <img
            className={classes.licenseIcon}
            src={activated ? activatedLicense : notActivatedLicense}
            height={20}
          />
        </Tooltip>
      </Box>
    </div>
  );
}

LicenseIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(LicenseIcon));
