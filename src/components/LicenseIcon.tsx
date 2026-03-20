// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import notActivatedLicense from '../res/notActivatedLicense.svg';
import activatedLicense from '../res/activatedLicense.svg';
import { Box } from '@mui/system';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useAppSelector } from '../store';


const useStyles = makeStyles()({
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
});


function LicenseIcon() {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const license = useAppSelector(state => state.license);
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

export default LicenseIcon;
