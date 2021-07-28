// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Checkbox, FormControl, FormControlLabel,
  Slider, TextField, Typography } from '@material-ui/core';
import blue from '../colors/blue';

const styles = theme => ({
  form: {
    width: '100%',
    margin: '12px 0px 0px 8px',
  },
  slider: {
    maxWidth: 400,
  },
  gridTf: {
    flex: 1,
    margin: theme.spacing(0, 1, 1, 0),
  },
  header: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  radio: {
    marginTop: 8,
  },
  blueCheckbox: {
    color: blue['500'],
  },
});

class SlimSyncPolicies extends PureComponent {

  render() {
    const { classes, t, syncPolicy, defaultPolicy, handleChange, handleSlider, handleCheckbox } = this.props;

    const { reqdevenc, allowsimpledevpw, devpwenabled, devpwexpiration, maxinacttimedevlock,
      devpwhistory, alphanumpwreq, maxdevpwfailedattempts, mindevpwlenngth, allowstoragecard,
      mindevcomplexchars } = syncPolicy;
    return (
      <FormControl className={classes.form}>
        <Typography variant="h6" className={classes.header}>{t('General')}</Typography>
        <FormControlLabel
          control={
            <Checkbox
              className={reqdevenc === defaultPolicy.reqdevenc ? "": classes.blueCheckbox}
              checked={!!reqdevenc}
              onChange={handleCheckbox('reqdevenc')}
              color={reqdevenc === defaultPolicy.reqdevenc ? "default" : "primary"}
            />
          }
          label={t('Require encryption on device')}
        />
        <FormControlLabel
          control={
            <Checkbox
              className={allowstoragecard === defaultPolicy.allowstoragecard ? "" : classes.blueCheckbox}
              checked={!!allowstoragecard}
              onChange={handleCheckbox('allowstoragecard')}
              color={allowstoragecard === defaultPolicy.allowstoragecard ? "default" : "primary"}
            />
          }
          label={t('Require encryption on storage card')}
        />
        <Typography variant="h6" className={classes.header}>{t('Passwords')}</Typography>
        <FormControlLabel
          control={
            <Checkbox
              className={devpwenabled === defaultPolicy.devpwenabled ? "" : classes.blueCheckbox}
              checked={!!devpwenabled}
              onChange={handleCheckbox('devpwenabled')}
              color={devpwenabled === defaultPolicy.devpwenabled ? "default" : "primary"}
            />
          }
          label={t('Password required')}
        />
        <FormControlLabel
          control={
            <Checkbox
              className={allowsimpledevpw === defaultPolicy.allowsimpledevpw ? "" : classes.blueCheckbox}
              checked={!!allowsimpledevpw}
              onChange={handleCheckbox('allowsimpledevpw')}
              color={allowsimpledevpw === defaultPolicy.allowsimpledevpw ? "default" : "primary"}
            />
          }
          label={t('Allow simple passwords')}
          style={{ marginBottom: 8 }}
        />
        <div>
          <Typography gutterBottom>
            {t('Minumim password length')}
          </Typography>
          <Slider
            className={classes.slider}
            value={mindevpwlenngth || 4}
            valueLabelDisplay="auto"
            color={mindevpwlenngth === defaultPolicy.mindevpwlenngth ? "secondary" : "primary"}
            step={1}
            marks
            min={1}
            max={16}
            onChange={handleSlider("mindevpwlenngth")}
          />
        </div>
        <FormControlLabel
          control={
            <Checkbox
              className={alphanumpwreq === defaultPolicy.alphanumpwreq ? "" : classes.blueCheckbox}
              checked={!!alphanumpwreq}
              onChange={handleCheckbox('alphanumpwreq')}
              color={alphanumpwreq === defaultPolicy.alphanumpwreq ? "default" : "primary"}
            />
          }
          label={t('Require alphanumeric password')}
          style={{ marginBottom: 8 }}
        />
        <div>
          <Typography gutterBottom>
            {t('Minumim password character sets')}
          </Typography>
          <Slider
            className={classes.slider}
            value={mindevcomplexchars || 3}
            valueLabelDisplay="auto"
            color={mindevcomplexchars === defaultPolicy.mindevcomplexchars ? "secondary" : "primary"}
            step={1}
            marks
            min={1}
            max={4}
            onChange={handleSlider("mindevcomplexchars")}
          />
        </div>
        <div>
          <Typography gutterBottom>
            {t('Number of failed attempts allowed')}
          </Typography>
          <Slider
            className={classes.slider}
            value={maxdevpwfailedattempts || 8}
            valueLabelDisplay="auto"
            color={maxdevpwfailedattempts === defaultPolicy.maxdevpwfailedattempts ? "secondary" : "primary"}
            step={1}
            marks
            min={4}
            max={16}
            onChange={handleSlider("maxdevpwfailedattempts")}
          />
        </div>
        <TextField
          className={classes.slider}
          label={t('Password expiration (days)')}
          value={devpwexpiration}
          InputLabelProps={{
            className: devpwexpiration === defaultPolicy.devpwexpiration ? "" : classes.blueCheckbox,
          }}
          onChange={handleChange("devpwexpiration")}
        />
        <TextField
          className={classes.slider}
          label={t("Inactivity (seconds) before device locks itself")}
          value={maxinacttimedevlock}
          onChange={handleChange("maxinacttimedevlock")}
          InputLabelProps={{
            className: maxinacttimedevlock === defaultPolicy.maxinacttimedevlock ? "" : classes.blueCheckbox,
          }}
        />
        <TextField
          className={classes.slider}
          style={{ marginBottom: 16 }}
          label={t("Password history")}
          value={devpwhistory}
          InputLabelProps={{
            className: devpwhistory === defaultPolicy.devpwhistory ? "" : classes.blueCheckbox,
          }}
          onChange={handleChange("devpwhistory")}
        />
      </FormControl>
    );
  }
}

SlimSyncPolicies.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  syncPolicy: PropTypes.object.isRequired,
  defaultPolicy: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleCheckbox: PropTypes.func.isRequired,
  handleSlider: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(SlimSyncPolicies));
