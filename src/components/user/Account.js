// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { PureComponent } from 'react';
import { Button, Checkbox, FormControl, FormControlLabel, Grid, IconButton, MenuItem,
  Select, TextField, Typography, withStyles, Tooltip } from '@material-ui/core';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import blue from '../../colors/blue';
import { red, yellow } from '@material-ui/core/colors';
import Delete from '@material-ui/icons/Delete';
import { DOMAIN_ADMIN_WRITE } from '../../constants';
import { CapabilityContext } from '../../CapabilityContext';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1, 0),
  },
  flexInput: {
    margin: theme.spacing(1),
    flex: 1,
  },
  quota: {
    border: `1px solid ${blue['500']}`,
    margin: theme.spacing(2, 0),
    padding: theme.spacing(0.5),
    borderRadius: '8px',
  },
  graphContainer: {
    padding: theme.spacing(0, 1),
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
    backgroundColor: '#ddd',
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

class Account extends PureComponent {

  types = [
    { name: 'User', ID: 0 },
    { name: 'Mail list', ID: 1 },
    { name: 'Room', ID: 7 },
    { name: 'Equipment', ID: 8 },
  ]

  statuses = [
    { name: 'Normal', ID: 0 },
    { name: 'Shared', ID: 4 },
  ]

  formatMSE(rawMSE) {
    let exp = Math.log(rawMSE) / Math.log(1024) | 0;
    let res = (rawMSE / Math.pow(1024, exp)).toFixed(1);

    return res + '' + (exp === 0 ? 'bytes' : 'KMGTPEZY'[exp - 1] + 'B');
  }

  calculateGraph() {
    const { classes, rawData, t } = this.props;
    const {
      messagesizeextended: rawMSE,
      storagequotalimit: rawSTQ,
      prohibitreceivequota: rawRQ,
      prohibitsendquota: rawSQ,
    } = rawData.properties || {};
    const readableMSE = this.formatMSE(rawMSE);
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

  render() {
    const { classes, t, user, domain, sizeUnits, handleInput, handlePropertyChange,
      handleIntPropertyChange, handleCheckbox, handleUnitChange,
      handlePasswordChange, handleQuotaDelete, handleChatUser } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { username, status, properties, smtp, pop3_imap, changePassword, ldapID, chat, chatAdmin } = user; //eslint-disable-line
    const { language, creationtime, displaytypeex, storagequotalimit, prohibitreceivequota,
      prohibitsendquota } = properties;
    return (
      <FormControl className={classes.form}>
        <Grid container className={classes.input}>
          <TextField
            label={t("Username")}
            value={username || ''}
            autoFocus
            style={{ flex: 1, marginRight: 8 }}
            InputProps={{
              endAdornment: <div>@{domain.domainname}</div>,
            }}
            disabled
          />
          {writable && status !== 4 && ldapID === null && <Button
            variant="contained"
            color="primary"
            onClick={handlePasswordChange}
            size="small"
          >
            {t('Change password')}
          </Button>}
        </Grid>
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
          label={t("Status")}
          fullWidth
          value={status || 0}
          onChange={handleInput('status')}
        >
          {this.statuses.map((status, key) => (
            <MenuItem key={key} value={status.ID}>
              {status.name}
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
          {this.types.map((type, key) => (
            <MenuItem key={key} value={type.ID}>
              {type.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          className={classes.input}
          label={t("Language")}
          fullWidth
          value={language || 'english'}
          onChange={handlePropertyChange('language')}
        >
          <MenuItem value={'english'}>
            {t('English')}
          </MenuItem>
          <MenuItem value={'german'}>
            {t('Deutsch')}
          </MenuItem>
        </TextField>
        <div className={classes.quota}>
          <Typography color="textPrimary" className={classes.quotaHeadline}>{t('Used space')}</Typography>
          <Grid container style={{ marginTop: 8 }}>
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
              InputProps={{
                endAdornment:
                  <FormControl className={classes.adornment}>
                    <Select
                      onChange={handleUnitChange('prohibitsendquota')}
                      value={sizeUnits.prohibitsendquota}
                      className={classes.select}
                    >
                      <MenuItem value={1}>MB</MenuItem>
                      <MenuItem value={2}>GB</MenuItem>
                      <MenuItem value={3}>TB</MenuItem>
                    </Select>
                    <Tooltip title={('Delete quota')} placement="top">
                      <IconButton size="small" onClick={handleQuotaDelete('prohibitsendquota')}>
                        <Delete color="error" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </FormControl>,
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
              InputProps={{
                endAdornment:
                  <FormControl className={classes.adornment}>
                    <Select
                      onChange={handleUnitChange('prohibitreceivequota')}
                      value={sizeUnits.prohibitreceivequota}
                      className={classes.select}
                    >
                      <MenuItem value={1}>MB</MenuItem>
                      <MenuItem value={2}>GB</MenuItem>
                      <MenuItem value={3}>TB</MenuItem>
                    </Select>
                    <Tooltip title={('Delete quota')} placement="top">
                      <IconButton size="small" onClick={handleQuotaDelete('prohibitreceivequota')}>
                        <Delete color="error" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </FormControl>,
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
              InputProps={{
                endAdornment:
                  <FormControl className={classes.adornment}>
                    <Select
                      onChange={handleUnitChange('storagequotalimit')}
                      value={sizeUnits.storagequotalimit}
                      className={classes.select}
                    >
                      <MenuItem value={1}>MB</MenuItem>
                      <MenuItem value={2}>GB</MenuItem>
                      <MenuItem value={3}>TB</MenuItem>
                    </Select>
                    <Tooltip title={('Delete quota')} placement="top">
                      <IconButton size="small" onClick={handleQuotaDelete('storagequotalimit')}>
                        <Delete color="error" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </FormControl>,
              }}
            />
            <div className={classes.graphContainer}>
              {this.calculateGraph()}
            </div>
          </Grid>
        </div>
        <TextField
          className={classes.input}
          label={t("Creation time")}
          fullWidth
          value={creationtime || ''}
          onChange={handlePropertyChange('creationtime')}
          disabled
        />
        <Grid container className={classes.input}>
          <FormControlLabel
            control={
              <Checkbox
                checked={smtp || false }
                onChange={handleCheckbox('smtp')}
                color="primary"
              />
            }
            label={t('Allow SMTP sending (used by POP3/IMAP clients)')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={changePassword || false }
                onChange={handleCheckbox('changePassword')}
                color="primary"
              />
            }
            label={t('Allow password changes')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={pop3_imap || false /*eslint-disable-line*/}
                onChange={handleCheckbox('pop3_imap')}
                color="primary"
              />
            }
            label={t('Allow POP3/IMAP logins')}
          />
        </Grid>
        <Tooltip
          placement="top-start"
          title={!domain.chat ? "This domain doesn't have a grommunio-chat team" : ''}
        >
          <Grid container className={classes.input}>
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
          </Grid>
        </Tooltip>
      </FormControl>
    );
  }
}

Account.contextType = CapabilityContext;
Account.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object,
  user: PropTypes.object.isRequired,
  sizeUnits: PropTypes.object.isRequired,
  handleInput: PropTypes.func.isRequired,
  handlePropertyChange: PropTypes.func.isRequired,
  handleIntPropertyChange: PropTypes.func.isRequired,
  handleCheckbox: PropTypes.func.isRequired,
  handleUnitChange: PropTypes.func.isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  handleQuotaDelete: PropTypes.func.isRequired,
  handleChatUser: PropTypes.func.isRequired,
  rawData: PropTypes.object,
};

export default withTranslation()(withStyles(styles)(Account));
