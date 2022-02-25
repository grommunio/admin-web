// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Checkbox, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup,
  Slider, TextField, Typography } from '@mui/material';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: 12,
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
});

class SyncPolicies extends PureComponent {

  render() {
    const { classes, t, syncPolicy, handleChange, handleRadio,
      handleSlider, handleCheckbox } = this.props;
    const { allowbluetooth, allowbrowser, allowcam, allowconsumeremail, allowdesktopsync,
      allowhtmlemail, allowinternetsharing, allowirda, allowpopimapemail, allowremotedesk,
      allowsimpledevpw, allowsmimeencalgneg, allowsmimesoftcerts, allowstoragecard,
      allowtextmessaging, allowunsignedapps, allowunsigninstallpacks, allowwifi, alphanumpwreq,
      approvedapplist, attenabled, devencenabled, devpwenabled, devpwexpiration, devpwhistory,
      maxattsize, maxcalagefilter, maxdevpwfailedattempts, maxemailagefilter, maxemailbodytruncsize,
      maxemailhtmlbodytruncsize, maxinacttimedevlock, mindevcomplexchars, mindevpwlenngth,
      pwrecoveryenabled, reqdevenc, reqencsmimealgorithm, reqencsmimemessages, reqmansyncroam,
      reqsignedsmimealgorithm, reqsignedsmimemessages, unapprovedinromapplist } = syncPolicy;
    return (
      <FormControl className={classes.form}>
        <Typography variant="h6" className={classes.header}>{t('Apps and devices')}</Typography>
        <FormControl component="fieldset" className={classes.radio}>
          <FormLabel component="legend">{t('Allow Bluetooth')}</FormLabel>
          <RadioGroup
            row
            value={syncPolicy.allowbluetooth !== undefined ? syncPolicy.allowbluetooth :
              allowbluetooth === undefined ? '' : allowbluetooth}
            onChange={handleRadio('allowbluetooth')}
          >
            <FormControlLabel value={0} control={<Radio color="primary"/>} label={t('Disabled')} />
            <FormControlLabel value={1} control={<Radio color="primary"/>} label={t('Allow only HFP')} />
            <FormControlLabel value={2} control={<Radio color="primary"/>} label={t('Allow')} />
          </RadioGroup>
        </FormControl>
        <Grid container>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowbrowser}
                onChange={handleCheckbox('allowbrowser')}
                color="primary"
              />
            }
            label={t('Allow browser')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowcam}
                onChange={handleCheckbox('allowcam')}
                color="primary"
              />
            }
            label={t('Allow cam')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowtextmessaging}
                onChange={handleCheckbox('allowtextmessaging')}
                color="primary"
              />
            }
            label={t('Allow text messaging')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowunsignedapps}
                onChange={handleCheckbox('allowunsignedapps')}
                color="primary"
              />
            }
            label={t('Allow unsigned apps')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowunsigninstallpacks}
                onChange={handleCheckbox('allowunsigninstallpacks')}
                color="primary"
              />
            }
            label={t('Allow unsigned install packs')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowinternetsharing}
                onChange={handleCheckbox('allowinternetsharing')}
                color="primary"
              />
            }
            label={t('Allow internet sharing')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowirda}
                onChange={handleCheckbox('allowirda')}
                color="primary"
              />
            }
            label={t('Allow IrDA')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowstoragecard}
                onChange={handleCheckbox('allowstoragecard')}
                color="primary"
              />
            }
            label={t('Allow storage card')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowwifi}
                onChange={handleCheckbox('allowwifi')}
                color="primary"
              />
            }
            label={t('Allow WiFi')}
          />
        </Grid>
        <Grid container>
          <TextField
            className={classes.gridTf}
            label={t("Approved in-ROM applications")}
            helperText="app1,app2,app3,..."
            color="primary"
            value={approvedapplist}
            onChange={handleChange("approvedapplist")}
          />
          <TextField
            className={classes.gridTf}
            label={t("Not approved in-ROM applications")}
            helperText="app1,app2,app3,..."
            color="primary"
            value={unapprovedinromapplist}
            onChange={handleChange("unapprovedinromapplist")}
          />
          <TextField
            className={classes.gridTf}
            label={t("Inactivity (seconds) before device locks itself")}
            color="primary"
            value={maxinacttimedevlock}
            onChange={handleChange("maxinacttimedevlock")}
          />
        </Grid>


        <Typography variant="h6" className={classes.header}>{t('Passwords')}</Typography>
        <Grid container>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!alphanumpwreq}
                onChange={handleCheckbox('alphanumpwreq')}
                color="primary"
              />
            }
            label={t('Requires alphanumeric password')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!devpwenabled}
                onChange={handleCheckbox('devpwenabled')}
                color="primary"
              />
            }
            label={t('Device password required')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowsimpledevpw}
                onChange={handleCheckbox('allowsimpledevpw')}
                color="primary"
              />
            }
            label={t('Allow simple passwords')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!pwrecoveryenabled}
                onChange={handleCheckbox('pwrecoveryenabled')}
                color="primary"
              />
            }
            label={t('Password recovery enabled')}
          />
        </Grid>
        <Grid container>
          <TextField
            className={classes.gridTf}
            label={t("Min number of passwords to store")}
            color="primary"
            value={devpwhistory}
            onChange={handleChange("devpwhistory")}
          />
          <TextField
            className={classes.gridTf}
            label={t('Device password history')}
            color="primary"
            value={devpwexpiration}
            onChange={handleChange("devpwexpiration")}
          />
        </Grid>
        <div>
          <Typography gutterBottom>
            {t('Max failed password attempts')}
          </Typography>
          <Slider
            className={classes.slider}
            value={maxdevpwfailedattempts || 8}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={4}
            max={16}
            onChange={handleSlider("maxdevpwfailedattempts")}
          />
        </div>
        <div>
          <Typography gutterBottom>
            {t('Minumim device password length')}
          </Typography>
          <Slider
            className={classes.slider}
            value={mindevpwlenngth || 4}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={16}
            onChange={handleSlider("mindevpwlenngth")}
          />
        </div>
        <div>
          <Typography gutterBottom>
            {t('Minumim password character classes')}
          </Typography>
          <Slider
            className={classes.slider}
            value={mindevcomplexchars || 3}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={4}
            onChange={handleSlider("mindevcomplexchars")}
          />
        </div>




        <Typography variant="h6" className={classes.header}>{t('Encryption and signing')}</Typography>
        <Grid container>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowsmimesoftcerts}
                onChange={handleCheckbox('allowsmimesoftcerts')}
                color="primary"
              />
            }
            label={t('Allow soft certificates')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!reqdevenc}
                onChange={handleCheckbox('allowcam')}
                color="primary"
              />
            }
            label={t('Device encryption')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!reqencsmimemessages}
                onChange={handleCheckbox('reqencsmimemessages')}
                color="primary"
              />
            }
            label={t('Requires encrypted messages')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!devencenabled}
                onChange={handleCheckbox('devencenabled')}
                color="primary"
              />
            }
            label={t('Enable device encryption (Deprecated)')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!reqsignedsmimemessages}
                onChange={handleCheckbox('reqsignedsmimemessages')}
                color="primary"
              />
            }
            label={t('Requires message signing')}
          />
        </Grid>
        <FormControl component="fieldset" className={classes.radio}>
          <FormLabel component="legend">{t('Encrypt algorithm')}</FormLabel>
          <RadioGroup
            color="primary"
            row
            value={reqencsmimealgorithm === undefined ? '' : reqencsmimealgorithm}
            onChange={handleRadio('reqencsmimealgorithm')}
          >
            <FormControlLabel value={0} control={<Radio color="primary"/>} label="TripleDES" />
            <FormControlLabel value={1} control={<Radio color="primary"/>} label="DES" />
            <FormControlLabel value={2} control={<Radio color="primary"/>} label="RC2128bit" />
            <FormControlLabel value={3} control={<Radio color="primary"/>} label="RC264bit" />
            <FormControlLabel value={4} control={<Radio color="primary"/>} label="RC240bit" />
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset" className={classes.radio}>
          <FormLabel component="legend">{t('Allow encrypt algorithm negotiation')}</FormLabel>
          <RadioGroup
            color="primary"
            row
            value={allowsmimeencalgneg === undefined ? '' : allowsmimeencalgneg}
            onChange={handleRadio('allowsmimeencalgneg')}
          >
            <FormControlLabel value={0} control={<Radio color="primary"/>} label={t('Not allow')} />
            <FormControlLabel value={1} control={<Radio color="primary"/>} label={t('Only strong')} />
            <FormControlLabel value={2} control={<Radio color="primary"/>} label={t('Any')} />
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset" className={classes.radio}>
          <FormLabel component="legend">{t('Message signing algorithm')}</FormLabel>
          <RadioGroup
            color="primary"
            row
            value={reqsignedsmimealgorithm === undefined ? '' : reqsignedsmimealgorithm}
            onChange={handleRadio('reqsignedsmimealgorithm')}
          >
            <FormControlLabel value={0} control={<Radio color="primary"/>} label="SHA1" />
            <FormControlLabel value={1} control={<Radio color="primary"/>} label="MD5" />
          </RadioGroup>
        </FormControl>




        <Typography variant="h6" className={classes.header}>{t('E-Mail')}</Typography>
        <Grid container>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowhtmlemail}
                onChange={handleCheckbox('allowhtmlemail')}
                color="primary"
              />
            }
            label={t('Allow html E-Mail')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowconsumeremail}
                onChange={handleCheckbox('allowconsumeremail')}
                color="primary"
              />
            }
            label={t('Allow consumer E-Mail')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowpopimapemail}
                onChange={handleCheckbox('allowpopimapemail')}
                color="primary"
              />
            }
            label={t('Allow POP/IMAP E-Mail')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!attenabled}
                onChange={handleCheckbox('attenabled')}
                color="primary"
              />
            }
            label={t('Enable attachments')}
          />
        </Grid>
        <TextField
          className={classes.slider}
          label={t("Max attachment size")}
          color="primary"
          value={maxattsize}
          onChange={handleChange("maxattsize")}
          InputProps={{
            endAdornment: 'MB',
          }}
          variant="standard"
          style={{ marginBottom: 8 }}
        />
        <TextField
          className={classes.slider}
          label={t("Truncation size for plain-text E-Mails")}
          helperText="(-1=unlimited, 0=header only, >0=truncate to size)"
          color="primary"
          value={maxemailbodytruncsize}
          onChange={handleChange("maxemailbodytruncsize")}
          variant="standard"
          style={{ marginBottom: 8 }}
        />
        <TextField
          className={classes.slider}
          label={t("Truncation size for HTML E-Mails")}
          helperText="(-1=unlimited, 0=header only, >0=truncate to size)"
          color="primary"
          value={maxemailhtmlbodytruncsize}
          onChange={handleChange("maxemailhtmlbodytruncsize")}
          variant="standard"
        />


        <Typography variant="h6" className={classes.header}>{t('Synchronisation')}</Typography>
        <Grid container>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowremotedesk}
                onChange={handleCheckbox('allowremotedesk')}
                color="primary"
              />
            }
            label={t('Allow remote desk')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!reqmansyncroam}
                onChange={handleCheckbox('reqmansyncroam')}
                color="primary"
              />
            }
            label={t('Requires manual synchronization')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!allowdesktopsync}
                onChange={handleCheckbox('allowdesktopsync')}
                color="primary"
              />
            }
            label={t('Allow desktop sync')}
          />
        </Grid>
        <FormControl component="fieldset" className={classes.radio}>
          <FormLabel component="legend">{t('Max calendar age')}</FormLabel>
          <RadioGroup
            color="primary"
            row
            value={maxcalagefilter === undefined ? '' : maxcalagefilter}
            onChange={handleRadio('maxcalagefilter')}
          >
            <FormControlLabel value={4} control={<Radio color="primary"/>} label={t('2 weeks')} />
            <FormControlLabel value={5} control={<Radio color="primary"/>} label={t('1 month')} />
            <FormControlLabel value={6} control={<Radio color="primary"/>} label={t('3 months')} />
            <FormControlLabel value={7} control={<Radio color="primary"/>} label={t('6 months')} />
            <FormControlLabel value={0} control={<Radio color="primary"/>} label={t('Unlimited')} />
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset" className={classes.radio} style={{ marginBottom: 8 }}>
          <FormLabel component="legend">{t('Max E-Mail age')}</FormLabel>
          <RadioGroup
            color="primary"
            row
            value={maxemailagefilter === undefined ? '' : maxemailagefilter}
            onChange={handleRadio('maxemailagefilter')}
          >
            <FormControlLabel value={1} control={<Radio color="primary"/>} label={t('1 day')} />
            <FormControlLabel value={2} control={<Radio color="primary"/>} label={t('3 days')} />
            <FormControlLabel value={3} control={<Radio color="primary"/>} label={t('1 week')} />
            <FormControlLabel value={4} control={<Radio color="primary"/>} label={t('2 weeks')} />
            <FormControlLabel value={5} control={<Radio color="primary"/>} label={t('1 month')} />
            <FormControlLabel value={0} control={<Radio color="primary"/>} label={t('All')} />
          </RadioGroup>
        </FormControl>
      </FormControl>
    );
  }
}

SyncPolicies.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  syncPolicy: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleCheckbox: PropTypes.func.isRequired,
  handleRadio: PropTypes.func.isRequired,
  handleSlider: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(SyncPolicies));
