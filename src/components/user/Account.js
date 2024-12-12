// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useMemo } from 'react';
import { Button, Checkbox, FormControl, FormControlLabel, Grid2, MenuItem,
  Select, TextField, Typography, Tooltip, InputLabel, OutlinedInput, Alert } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { red, yellow } from '@mui/material/colors';
import { DOMAIN_ADMIN_WRITE, SYSTEM_ADMIN_READ, SYSTEM_ADMIN_WRITE } from '../../constants';
import { CapabilityContext } from '../../CapabilityContext';
import { connect } from 'react-redux';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  flexInput: {
    margin: theme.spacing(1, 1, 1, 1),
    flex: 1,
  },
  quota: {
    border: `1px solid ${theme.palette.primary['500']}`,
    margin: theme.spacing(2, 0, 2, 0),
    padding: theme.spacing(0.5),
    borderRadius: '8px',
  },
  graphContainer: {
    padding: theme.spacing(0, 1, 0, 1),
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    marginRight: 16,
  },
  select: {
    minWidth: 60,
  },
  barBackground: {
    width: '100%',
    height: 24,
    backgroundImage: 'linear-gradient(150deg, #949494, #343434)',
    position: 'relative',
  },
  quotaHeadline: {
    marginTop: -16,
    marginBottom: 0,
    padding: theme.spacing(0, 0.5),
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  adornment: {
    display: 'contents',
  },
});

const Account = props => {
  const context = useContext(CapabilityContext);
  const { t } = useTranslation();

  const types = [
    { name: 'User', ID: 0 },
    { name: 'Room', ID: 7 },
    { name: 'Equipment', ID: 8 },
  ]

  const statuses = [
    { name: 'Normal', ID: 0 },
    { name: 'Suspended', ID: 1 },
    { name: 'Shared', ID: 4 },
  ]

  const hiddenFrom = [
    { ID: 1, name: 'Global Address List', value: 0x01 },
    { ID: 2, name: 'Address/Member lists', value: 0x02 },
    { ID: 3, name: 'Delegate lists', value: 0x04 },
    { ID: 4, name: 'Ambiguous Name Resolution', value: 0x08 }
  ]

  const formatMSE = (rawMSE) => {
    let exp = Math.log(rawMSE) / Math.log(1024) | 0;
    let res = (rawMSE / Math.pow(1024, exp)).toFixed(1);

    return res + '' + (exp === 0 ? 'bytes' : 'kMGTPEZYRQ'[exp - 1] + 'B');
  }

  const calculateGraph = () => {
    const { classes, rawData } = props;
    const {
      messagesizeextended: rawMSE,
      storagequotalimit: rawSTQ,
      prohibitreceivequota: rawRQ,
      prohibitsendquota: rawSQ,
    } = rawData.properties || {};
    const readableMSE = formatMSE(rawMSE);
    const usedSpace = ((rawMSE / rawSTQ / 1024) * 100 || 0).toFixed(0) + '%';
    const rqPosition = (rawRQ / rawSTQ * 100).toFixed(0) + '%';
    const sqPosition = (rawSQ / rawSTQ * 100).toFixed(0) + '%';
    return <div className={classes.barBackground}>
      <div
        style={{
          position: 'absolute',
          zIndex: 6,
          top: 0,
          width: '100%',
        }}
      >
        <Typography align="center">
          {rawMSE !== undefined ? `${readableMSE} (${usedSpace})` : t('Store size indeterminate')}
        </Typography>
      </div>
      <div
        style={{
          width: usedSpace,
          height: 24,
          background: 'linear-gradient(150deg, #56CCF2, #2F80ED)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          zIndex: 5,
          width: sqPosition,
          height: 24,
          borderRight: `4px solid ${yellow['500']}`,
          top: 0,
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          zIndex: 5,
          width: rqPosition,
          height: 24,
          borderRight: `4px solid ${red['500']}`,
          top: 0,
        }}
      ></div>
    </div>;
  }

  const getQuotaWarning = () => {
    const {
      messagesizeextended: rawMSE,
      storagequotalimit: rawSTQ,
      prohibitreceivequota: rawRQ,
      prohibitsendquota: rawSQ,
    } = props.rawData.properties || {};
    const over100 = [rawSTQ, rawRQ, rawSQ].some(quota => quota > 104857600);

    if(over100) {
      return rawMSE > 104857600 ? t("quotaWarning4") : t("quotaWarning3");
    }
    const over50 = [rawSTQ, rawRQ, rawSQ].some(quota => quota > 52428800);
    if(over50) {
      return rawMSE > 52428800 ? t("quotaWarning2") : t("quotaWarning1");
    }
    return "";
  }

  const quotaWarning = useMemo(getQuotaWarning, [props.rawData]);

  const { classes, user, domain, sizeUnits, handleStatusInput, handlePropertyChange,
    handleIntPropertyChange, handleCheckbox, handleUnitChange, langs,
    handlePasswordChange, handleChatUser, handleServer, handlePropertyCheckbox,
    servers, handleInput, handleMultiselectChange, storageQuotaTooHigh } = props;
  const writable = context.includes(DOMAIN_ADMIN_WRITE);
    const { username, status, properties, smtp, pop3_imap, changePassword, lang, //eslint-disable-line
    ldapID, chat, chatAdmin, privChat, privVideo, privFiles, privArchive, homeserver } = user;
  const { creationtime, displaytypeex, storagequotalimit, prohibitreceivequota,
    prohibitsendquota, attributehidden_gromox, scheduleinfoautoacceptappointments,
    scheduleinfodisallowoverlappingappts, scheduleinfodisallowrecurringappts } = properties;

  return (
    (<FormControl className={classes.form}>
      <Grid2 container className={classes.input}>
        <TextField
          label={t("Username")}
          value={username || ''}
          style={{ flex: 1, marginRight: 8 }}
          onChange={handleInput('username')}
          slotProps={{
            input: {
              endAdornment: <div style={{ whiteSpace: 'nowrap' }}>@{domain.domainname}</div>,
            }
          }}
        />
        {writable && status !== 4 && ldapID === null && <Button
          variant="contained"
          color="primary"
          onClick={handlePasswordChange}
          size="small"
        >
          {t('Change password')}
        </Button>}
      </Grid2>
      {ldapID && <TextField 
        label={t("LDAP ID")}
        className={classes.input}
        value={ldapID || ''}
        disabled
        style={{ flex: 1, marginRight: 8 }}
      />}
      <TextField
        select
        className={classes.input}
        label={t("Mode")}
        fullWidth
        value={status || 0}
        onChange={handleStatusInput}
      >
        {statuses.map((status, key) => (
          <MenuItem key={key} value={status.ID}>
            {t(status.name)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        className={classes.input}
        label={t("Type")}
        fullWidth
        disabled={displaytypeex === 1}
        value={displaytypeex || 0}
        onChange={handlePropertyChange('displaytypeex')}
      >
        {types.map((type, key) => (
          <MenuItem key={key} value={type.ID}>
            {t(type.name)}
          </MenuItem>
        ))}
      </TextField>
      {context.includes(SYSTEM_ADMIN_READ) && <MagnitudeAutocomplete
        value={homeserver || ''}
        filterAttribute={'hostname'}
        onChange={handleServer}
        className={classes.input} 
        options={servers}
        label={t('Homeserver')}
        disabled={!context.includes(SYSTEM_ADMIN_WRITE)}
        isOptionEqualToValue={(option, value) => option.ID === value.ID}
      />}
      <TextField
        select
        className={classes.input}
        label={t("Language")}
        fullWidth
        value={(langs.length ? lang || 'en_US' : "")}
        disabled
      >
        {langs.map((l) => (
          <MenuItem key={l.code} value={l.code}>
            {l.code + ": " + l.name}
          </MenuItem>
        ))}
      </TextField>
      <div className={classes.quota}>
        <Typography color="textPrimary" className={classes.quotaHeadline}>{t('Used space')}</Typography>
        <Grid2 container style={{ marginTop: 8 }}>
          <TextField 
            className={classes.flexInput}
            label={
              <div className={classes.labelContainer}>
                {t("Send quota limit")}
                <div style={{ width: 6, height: 6, backgroundColor: yellow['500'], marginLeft: 4 }}></div>
              </div>
            }
            value={prohibitsendquota !== undefined ? prohibitsendquota : ''}
            onChange={handleIntPropertyChange('prohibitsendquota')}
            slotProps={{
              input: {
                endAdornment:
                    <FormControl className={classes.adornment}>
                      <Select
                        onChange={handleUnitChange('prohibitsendquota')}
                        value={sizeUnits.prohibitsendquota}
                        className={classes.select}
                        variant="standard"
                      >
                        <MenuItem value={1}>MB</MenuItem>
                        <MenuItem value={2}>GB</MenuItem>
                        <MenuItem value={3}>TB</MenuItem>
                      </Select>
                    </FormControl>,
              }
            }}
          />
          <TextField 
            className={classes.flexInput}
            label={
              <div className={classes.labelContainer}>
                {t("Receive quota limit")}
                <div style={{ width: 6, height: 6, backgroundColor: red['500'], marginLeft: 4 }}></div>
              </div>
            }
            value={prohibitreceivequota !== undefined ? prohibitreceivequota : ''}
            onChange={handleIntPropertyChange('prohibitreceivequota')}
            slotProps={{
              input: {
                endAdornment:
                    <FormControl className={classes.adornment}>
                      <Select
                        onChange={handleUnitChange('prohibitreceivequota')}
                        value={sizeUnits.prohibitreceivequota}
                        className={classes.select}
                        variant="standard"
                      >
                        <MenuItem value={1}>MB</MenuItem>
                        <MenuItem value={2}>GB</MenuItem>
                        <MenuItem value={3}>TB</MenuItem>
                      </Select>
                    </FormControl>,
              }
            }}
          />
          <TextField 
            className={classes.flexInput}
            label={
              <div className={classes.labelContainer}>
                {t("Storage quota limit")}
                <div style={{ width: 6, height: 6, backgroundColor: '#ddd', marginLeft: 4 }}></div>
              </div>
            }
            value={storagequotalimit !== undefined ? storagequotalimit : ''}
            onChange={handleIntPropertyChange('storagequotalimit')}
            helperText={storageQuotaTooHigh ? "Mailbox size cannot exceed 3TiB" : ""}
            error={storageQuotaTooHigh}
            slotProps={{
              input: {
                endAdornment:
                    <FormControl className={classes.adornment}>
                      <Select
                        onChange={handleUnitChange('storagequotalimit')}
                        value={sizeUnits.storagequotalimit}
                        className={classes.select}
                        variant="standard"
                      >
                        <MenuItem value={1}>MB</MenuItem>
                        <MenuItem value={2}>GB</MenuItem>
                        <MenuItem value={3}>TB</MenuItem>
                      </Select>
                    </FormControl>,
              }
            }}
          />
          <div className={classes.graphContainer}>
            {calculateGraph()}
          </div>
        </Grid2>
        <Grid2 container>
          {quotaWarning && <Alert style={{ flex: 1, margin: 8 }} severity="warning">
            {quotaWarning}
          </Alert>}
        </Grid2>
      </div>
      <FormControl className={classes.input} fullWidth>
        <InputLabel id="demo-multiple-name-label">{t("Hide user from…")}</InputLabel>
        <Select
          multiple
          // Transform bitmask to array elements
          value={attributehidden_gromox ? [attributehidden_gromox & 1, attributehidden_gromox & 2, attributehidden_gromox & 4, attributehidden_gromox & 8] : []}
          onChange={handleMultiselectChange('attributehidden_gromox')}
          input={<OutlinedInput label={t("Hide user from…")}/>}
        >
          {hiddenFrom.map(({ ID, name, value }) => (
            <MenuItem
              key={ID}
              value={value}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        className={classes.input}
        label={t("Creation time")}
        fullWidth
        value={creationtime || ''}
        onChange={handlePropertyChange('creationtime')}
        disabled
      />
      <Typography sx={{ mt: 1 }}>
        {t("Automatic processing of meeting requests")}
      </Typography>
      <Grid2 container direction="column" sx={{ py: 1, px: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(scheduleinfodisallowrecurringappts) || false}
              onChange={handlePropertyCheckbox("scheduleinfodisallowrecurringappts")}
              color="primary"
            />
          }
          label={t('Decline all recurring meeting requests.')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(scheduleinfodisallowoverlappingappts) || false}
              onChange={handlePropertyCheckbox("scheduleinfodisallowoverlappingappts")}
              color="primary"
            />
          }
          label={t('Decline all meeting requests with scheduling conflicts.')}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(scheduleinfoautoacceptappointments) || false}
              onChange={handlePropertyCheckbox("scheduleinfoautoacceptappointments")}
              color="primary"
            />
          }
          label={`${t('Accept conflict-free meeting requests')}. (${t("If unchecked, requests will be added to the calendar as tenative only, with no response towards the organizer")})`}
        />
      </Grid2>
      <Typography sx={{ mt: 1 }}>
        {t("Features")}
      </Typography>
      <Grid2 container direction="column" sx={{ py: 1, px: 2 }}>

        {status !== 4 && <Tooltip
          placement="top-start"
          title={!domain.chat ? "This domain doesn't have a grommunio-chat team" : ''}
        >
          <Grid2 container>
            <FormControlLabel
              control={
                <Checkbox
                  checked={chat || false}
                  onChange={handleChatUser}
                  color="primary"
                />
              }
              label={t('Create grommunio-chat User')}
              disabled={!domain.chat}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={chatAdmin || false}
                  onChange={handleCheckbox('chatAdmin')}
                  color="primary"
                />
              }
              disabled={!chat || !domain.chat}
              label={t('grommunio-chat admin permissions')}
            />
          </Grid2>
        </Tooltip>}
        <Grid2 container>
          {status !== 4 && <FormControlLabel
            control={
              <Checkbox
                checked={smtp || false }
                onChange={handleCheckbox('smtp')}
                color="primary"
              />
            }
            label={t('Allow SMTP sending (used by POP3/IMAP clients)')}
          />}
          {status !== 4 && <FormControlLabel
            control={
              <Checkbox
                checked={changePassword || false }
                onChange={handleCheckbox('changePassword')}
                color="primary"
              />
            }
            label={t('Allow password changes')}
          />}
          {status !== 4 && <FormControlLabel
            control={
              <Checkbox
                  checked={pop3_imap || privArchive || false /*eslint-disable-line*/}
                onChange={handleCheckbox('pop3_imap')}
                color="primary"
                disabled={privArchive}
              />
            }
            label={t('Allow POP3/IMAP logins')}
          />}
        </Grid2>
        {status !== 4 && <Grid2 container>
          <FormControlLabel
            control={
              <Checkbox
                checked={privChat || false}
                onChange={handleCheckbox('privChat')}
                color="primary"
              />
            }
            disabled={!chat}
            label={t('Allow Chat')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={privVideo || false }
                onChange={handleCheckbox('privVideo')}
                color="primary"
              />
            }
            label={t('Allow Meet')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={privFiles || false }
                onChange={handleCheckbox('privFiles')}
                color="primary"
              />
            }
            label={t('Allow Files')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={privArchive || false}
                value={privFiles || false}
                onChange={handleCheckbox('privArchive')}
                color="primary"
              />
            }
            label={t('Allow Archive')}
          />
        </Grid2>}
      </Grid2>
    </FormControl>)
  );
}

Account.propTypes = {
  classes: PropTypes.object.isRequired,
  domain: PropTypes.object,
  user: PropTypes.object.isRequired,
  sizeUnits: PropTypes.object.isRequired,
  handleInput: PropTypes.func.isRequired,
  handleStatusInput: PropTypes.func.isRequired,
  handlePropertyChange: PropTypes.func.isRequired,
  handleIntPropertyChange: PropTypes.func.isRequired,
  handleCheckbox: PropTypes.func.isRequired,
  handleUnitChange: PropTypes.func.isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  handleChatUser: PropTypes.func.isRequired,
  handleServer: PropTypes.func.isRequired,
  handlePropertyCheckbox: PropTypes.func.isRequired,
  rawData: PropTypes.object,
  langs: PropTypes.array,
  servers: PropTypes.array.isRequired,
  handleMultiselectChange: PropTypes.func.isRequired,
  storageQuotaTooHigh: PropTypes.bool,
};

const mapStateToProps = state => {
  return {
    servers: state.servers.Servers,
  };
};

export default connect(mapStateToProps)(withStyles(Account, styles));
