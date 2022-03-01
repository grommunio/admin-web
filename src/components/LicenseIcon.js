import React from 'react';
import PropTypes from 'prop-types';
import notActivatedLicense from '../res/notActivatedLicense.svg';
import activatedLicense from '../res/activatedLicense.svg';
import { withStyles } from '@mui/styles';

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  licenseIcon: {
    cursor: 'pointer',
    marginRight: 8,
  },
};

function LicenseIcon({ classes, activated, handleNavigation }) {

  return (
    <div className={classes.root}>
      <img
        className={classes.licenseIcon}
        src={activated ? activatedLicense : notActivatedLicense}
        width={32}
        height={25}
        onClick={handleNavigation('license')}
      />
    </div>
  );
}

LicenseIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  activated: PropTypes.bool,
  handleNavigation: PropTypes.func.isRequired,
};

export default withStyles(styles)(LicenseIcon);
