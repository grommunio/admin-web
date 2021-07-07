// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup,
  Slider, TextField, Typography } from '@material-ui/core';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  slider: {
    maxWidth: 400,
  },
});

class SyncPolicies extends PureComponent {

  render() {
    const { classes, t, defaultPolicy, syncPolicy, handleChange, handleRadio,
      handleSlider, handleCheckbox } = this.props;
    const { allowbluetooth, allowbrowser, allowcam, allowconsumeremail, allowdesktopsync,
      allowhtmlemail, allowinternetsharing, allowirda, allowpopimapemail, allowremotedesk,
      allowsimpledevpw, allowsmimeencalgneg, allowsmimesoftcerts, allowstoragecard,
      allowtextmessaging, allowunsignedapps, allowunsigninstallpacks, allowwifi, alphanumpwreq,
      approvedapplist, attenabled, devencenabled, devpwenabled, devpwexpiration, devpwhistory,
      maxattsize, maxcalagefilter, maxdevpwfailedattempts, maxemailagefilter, maxemailbodytruncsize,
      maxemailhtmlbodytruncsize, maxinacttimedevlock, mindevcomplexchars, mindevpwlenngth,
      pwrecoveryenabled, reqdevenc, reqencsmimealgorithm, reqencsmimemessages, reqmansyncroam,
      reqsignedsmimealgorithm, reqsignedsmimemessages, unapprovedinromapplist } = defaultPolicy;
    return (
      <FormControl className={classes.form}>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('Allow Bluetooth')}</FormLabel>
          <RadioGroup
            color="primary"
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
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowbrowser !== undefined ? !!syncPolicy.allowbrowser : !!allowbrowser}
              onChange={handleCheckbox('allowbrowser')}
              color="primary"
            />
          }
          label={t('Allow browser')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowcam !== undefined ? !!syncPolicy.allowcam : !!allowcam}
              onChange={handleCheckbox('allowcam')}
              color="primary"
            />
          }
          label={t('Allow cam')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowconsumeremail !== undefined ? !!syncPolicy.allowconsumeremail : !!allowconsumeremail}
              onChange={handleCheckbox('allowconsumeremail')}
              color="primary"
            />
          }
          label={t('Allow consumer E-Mail')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowdesktopsync !== undefined ? !!syncPolicy.allowdesktopsync : !!allowdesktopsync}
              onChange={handleCheckbox('allowdesktopsync')}
              color="primary"
            />
          }
          label={t('Allow desktop sync')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowhtmlemail !== undefined ? !!syncPolicy.allowhtmlemail : !!allowhtmlemail}
              onChange={handleCheckbox('allowhtmlemail')}
              color="primary"
            />
          }
          label={t('Allow html E-Mail')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowinternetsharing !== undefined ? !!syncPolicy.allowinternetsharing : !!allowinternetsharing}
              onChange={handleCheckbox('allowinternetsharing')}
              color="primary"
            />
          }
          label={t('Allow internet sharing')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowirda !== undefined ? !!syncPolicy.allowirda : !!allowirda}
              onChange={handleCheckbox('allowirda')}
              color="primary"
            />
          }
          label={t('Allow IrDA')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowpopimapemail !== undefined ? !!syncPolicy.allowpopimapemail : !!allowpopimapemail}
              onChange={handleCheckbox('allowpopimapemail')}
              color="primary"
            />
          }
          label={t('Allow POP/IMAP E-Mail')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowremotedesk !== undefined ? !!syncPolicy.allowremotedesk : !!allowremotedesk}
              onChange={handleCheckbox('allowremotedesk')}
              color="primary"
            />
          }
          label={t('Allow remote desk')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowsimpledevpw !== undefined ? !!syncPolicy.allowsimpledevpw : !!allowsimpledevpw}
              onChange={handleCheckbox('allowsimpledevpw')}
              color="primary"
            />
          }
          label={t('Allow simple passwords')}
        />
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('Allow encrypt algorithm negotiation')}</FormLabel>
          <RadioGroup
            color="primary"
            row
            value={syncPolicy.allowsmimeencalgneg !== undefined ? syncPolicy.allowsmimeencalgneg :
              allowsmimeencalgneg === undefined ? '' : allowsmimeencalgneg}
            onChange={handleRadio('allowsmimeencalgneg')}
          >
            <FormControlLabel value={0} control={<Radio color="primary"/>} label={t('Not allow')} />
            <FormControlLabel value={1} control={<Radio color="primary"/>} label={t('Only strong')} />
            <FormControlLabel value={2} control={<Radio color="primary"/>} label={t('Any')} />
          </RadioGroup>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowsmimesoftcerts !== undefined ? !!syncPolicy.allowsmimesoftcerts : !!allowsmimesoftcerts}
              onChange={handleCheckbox('allowsmimesoftcerts')}
              color="primary"
            />
          }
          label={t('Allow soft certificates')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowstoragecard !== undefined ? !!syncPolicy.allowstoragecard : !!allowstoragecard}
              onChange={handleCheckbox('allowstoragecard')}
              color="primary"
            />
          }
          label={t('Allow storage card')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowtextmessaging !== undefined ? !!syncPolicy.allowtextmessaging : !!allowtextmessaging}
              onChange={handleCheckbox('allowtextmessaging')}
              color="primary"
            />
          }
          label={t('Allow text messaging')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowunsignedapps !== undefined ? !!syncPolicy.allowunsignedapps : !!allowunsignedapps}
              onChange={handleCheckbox('allowunsignedapps')}
              color="primary"
            />
          }
          label={t('Allow unsigned apps')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowcam !== undefined ? !!syncPolicy.allowunsigninstallpacks : !!allowunsigninstallpacks}
              onChange={handleCheckbox('allowunsigninstallpacks')}
              color="primary"
            />
          }
          label={t('Allow unsigned install packs')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowwifi !== undefined ? !!syncPolicy.allowwifi : !!allowwifi}
              onChange={handleCheckbox('allowwifi')}
              color="primary"
            />
          }
          label={t('Allow WiFi')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.alphanumpwreq !== undefined ? !!syncPolicy.alphanumpwreq : !!alphanumpwreq}
              onChange={handleCheckbox('alphanumpwreq')}
              color="primary"
            />
          }
          label={t('Requires alphanumeric password')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.attenabled !== undefined ? !!syncPolicy.attenabled : !!attenabled}
              onChange={handleCheckbox('attenabled')}
              color="primary"
            />
          }
          label={t('Enable attachments')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.devencenabled !== undefined ? !!syncPolicy.devencenabled : !!devencenabled}
              onChange={handleCheckbox('devencenabled')}
              color="primary"
            />
          }
          label={t('Enable device encryption (Deprecated)')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.devpwenabled !== undefined ? !!syncPolicy.devpwenabled : !!devpwenabled}
              onChange={handleCheckbox('devpwenabled')}
              color="primary"
            />
          }
          label={t('Device password required')}
        />
        <TextField
          className={classes.slider}
          label={t("Min number of passwords to store")}
          color="primary"
          value={syncPolicy.devpwhistory !== undefined ? syncPolicy.devpwhistory : devpwhistory}
          onChange={handleChange("devpwhistory")}
        />
        <TextField
          className={classes.slider}
          label={t('Device password history')}
          color="primary"
          value={syncPolicy.devpwexpiration !== undefined ? syncPolicy.devpwexpiration : devpwexpiration}
          onChange={handleChange("devpwexpiration")}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.allowcam !== pwrecoveryenabled ? !!syncPolicy.pwrecoveryenabled : !!pwrecoveryenabled}
              onChange={handleCheckbox('pwrecoveryenabled')}
              color="primary"
            />
          }
          label={t('Password recovery enabled')}
        />
        <TextField
          className={classes.slider}
          label={t("Max attachment size")}
          color="primary"
          value={syncPolicy.maxattsize !== undefined ? syncPolicy.maxattsize : maxattsize}
          onChange={handleChange("maxattsize")}
        />
        <div>
          <Typography gutterBottom>
            {t('Max failed password attempts')}
          </Typography>
          <Slider
            className={classes.slider}
            value={syncPolicy.maxdevpwfailedattempts !== undefined ? syncPolicy.maxdevpwfailedattempts : maxdevpwfailedattempts || 8}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={4}
            max={16}
            onChange={handleSlider("maxdevpwfailedattempts")}
          />
        </div>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('Max calendar age')}</FormLabel>
          <RadioGroup
            color="primary"
            row
            value={syncPolicy.maxcalagefilter !== undefined ? syncPolicy.maxcalagefilter :
              maxcalagefilter === undefined ? '' : maxcalagefilter}
            onChange={handleRadio('maxcalagefilter')}
          >
            <FormControlLabel value={4} control={<Radio color="primary"/>} label={t('2 weeks')} />
            <FormControlLabel value={5} control={<Radio color="primary"/>} label={t('1 month')} />
            <FormControlLabel value={6} control={<Radio color="primary"/>} label={t('3 months')} />
            <FormControlLabel value={7} control={<Radio color="primary"/>} label={t('6 months')} />
            <FormControlLabel value={0} control={<Radio color="primary"/>} label={t('Unlimited')} />
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('Max E-Mail age')}</FormLabel>
          <RadioGroup
            color="primary"
            row
            value={syncPolicy.maxemailagefilter !== undefined ? syncPolicy.maxemailagefilter :
              maxemailagefilter === undefined ? '' : maxemailagefilter}
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
        <TextField
          className={classes.slider}
          label={t("Truncation size for plain-text E-Mails")}
          helperText="(-1=unlimited, 0=header only, >0=truncate to size)"
          color="primary"
          value={syncPolicy.maxemailbodytruncsize !== undefined ? syncPolicy.maxemailbodytruncsize : maxemailbodytruncsize}
          onChange={handleChange("maxemailbodytruncsize")}
        />
        <TextField
          className={classes.slider}
          label={t("Truncation size for HTML E-Mails")}
          helperText="(-1=unlimited, 0=header only, >0=truncate to size)"
          color="primary"
          value={syncPolicy.maxemailhtmlbodytruncsize !== undefined ? syncPolicy.maxemailhtmlbodytruncsize : maxemailhtmlbodytruncsize}
          onChange={handleChange("maxemailhtmlbodytruncsize")}
        />
        <TextField
          className={classes.slider}
          label={t("Inactivity (seconds) before device locks itself")}
          color="primary"
          value={syncPolicy.maxinacttimedevlock !== undefined ? syncPolicy.maxinacttimedevlock : maxinacttimedevlock}
          onChange={handleChange("maxinacttimedevlock")}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.reqdevenc !== undefined ? !!syncPolicy.reqdevenc : !!reqdevenc}
              onChange={handleCheckbox('allowcam')}
              color="primary"
            />
          }
          label={t('Device encryption')}
        />
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('Encrypt algorithm')}</FormLabel>
          <RadioGroup
            color="primary"
            row
            value={syncPolicy.reqencsmimealgorithm !== undefined ? syncPolicy.reqencsmimealgorithm :
              reqencsmimealgorithm === undefined ? '' : reqencsmimealgorithm}
            onChange={handleRadio('reqencsmimealgorithm')}
          >
            <FormControlLabel value={0} control={<Radio color="primary"/>} label="TripleDES" />
            <FormControlLabel value={1} control={<Radio color="primary"/>} label="DES" />
            <FormControlLabel value={2} control={<Radio color="primary"/>} label="RC2128bit" />
            <FormControlLabel value={3} control={<Radio color="primary"/>} label="RC264bit" />
            <FormControlLabel value={4} control={<Radio color="primary"/>} label="RC240bit" />
          </RadioGroup>
        </FormControl>
        <div>
          <Typography gutterBottom>
            {t('Minumim device password length')}
          </Typography>
          <Slider
            className={classes.slider}
            value={syncPolicy.mindevpwlenngth !== undefined ? syncPolicy.mindevpwlenngth : mindevpwlenngth || 4}
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
            value={syncPolicy.mindevcomplexchars !== undefined ? syncPolicy.mindevcomplexchars : mindevcomplexchars || 3}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={4}
            onChange={handleSlider("mindevcomplexchars")}
          />
        </div>
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.reqencsmimemessages !== undefined ? !!syncPolicy.reqencsmimemessages : !!reqencsmimemessages}
              onChange={handleCheckbox('reqencsmimemessages')}
              color="primary"
            />
          }
          label={t('Requires encrypted messages')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.reqmansyncroam !== undefined ? !!syncPolicy.reqmansyncroam : !!reqmansyncroam}
              onChange={handleCheckbox('reqmansyncroam')}
              color="primary"
            />
          }
          label={t('Requires manual synchronization')}
        />
        <FormControl component="fieldset">
          <FormLabel component="legend">{t('Message signing algorithm')}</FormLabel>
          <RadioGroup
            color="primary"
            row
            value={syncPolicy.reqsignedsmimealgorithm !== undefined ? syncPolicy.reqsignedsmimealgorithm :
              reqsignedsmimealgorithm === undefined ? '' : reqsignedsmimealgorithm}
            onChange={handleRadio('reqsignedsmimealgorithm')}
          >
            <FormControlLabel value={0} control={<Radio color="primary"/>} label="SHA1" />
            <FormControlLabel value={1} control={<Radio color="primary"/>} label="MD5" />
          </RadioGroup>
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={syncPolicy.reqsignedsmimemessages !== undefined ? !!syncPolicy.reqsignedsmimemessages : !!reqsignedsmimemessages}
              onChange={handleCheckbox('reqsignedsmimemessages')}
              color="primary"
            />
          }
          label={t('Requires message signing')}
        />
        <TextField
          className={classes.slider}
          label={t("Approved in-ROM applications")}
          helperText="app1,app2,app3,..."
          color="primary"
          value={syncPolicy.approvedapplist !== undefined ? syncPolicy.approvedapplist : approvedapplist}
          onChange={handleChange("approvedapplist")}
        />
        <TextField
          className={classes.slider}
          label={t("Not approved in-ROM applications")}
          helperText="app1,app2,app3,..."
          color="primary"
          value={syncPolicy.unapprovedinromapplist !== undefined ? syncPolicy.unapprovedinromapplist : unapprovedinromapplist}
          onChange={handleChange("unapprovedinromapplist")}
        />
      </FormControl>
    );
  }
}

SyncPolicies.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  defaultPolicy: PropTypes.object.isRequired,
  syncPolicy: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleCheckbox: PropTypes.func.isRequired,
  handleRadio: PropTypes.func.isRequired,
  handleSlider: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(SyncPolicies));
