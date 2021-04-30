import React, { PureComponent } from 'react';
import { Button, Checkbox, FormControl, FormControlLabel, Grid, MenuItem,
  Select, TextField, Typography, withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import blue from '../../colors/blue';
import { red, yellow } from '@material-ui/core/colors';

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
  },
  select: {
    minWidth: 60,
  },
  barBackground: {
    width: '100%',
    height: 20,
    backgroundColor: '#ddd',
    position: 'relative',
  },
  quotaHeadline: {
    marginTop: -16,
    marginBottom: 8,
    padding: theme.spacing(0, 0.5),
    backgroundColor: theme.palette.background.paper,
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
  },
});

class Account extends PureComponent {

  types = [
    { name: 'User', ID: 0 },
    { name: 'MList', ID: 1 },
    { name: 'Room', ID: 7 },
    { name: 'Equipment', ID: 8 },
  ]

  statuses = [
    { name: 'Normal', ID: 0 },
    { name: 'Suspended', ID: 1 },
    { name: 'Out of date', ID: 2 },
    { name: 'Deleted', ID: 3 },
  ]

  calculateGraph() {
    const { classes, rawData } = this.props;
    const {
      messagesizeextended: rawMSE,
      storagequotalimit: rawSTQ,
      prohibitreceivequota: rawRQ,
      prohibitsendquota: rawSQ,
    } = rawData.properties || {};
    const usedSpace = ((rawMSE / rawSTQ / 1024) * 100).toFixed(0) + '%';
    const rqPosition = (rawRQ / rawSTQ * 100).toFixed(0) + '%';
    const sqPosition = (rawSQ / rawSTQ * 100).toFixed(0) + '%';
    return <div className={classes.barBackground}>
      <div
        style={{
          width: usedSpace,
          height: 20,
          background: 'linear-gradient(150deg, #56CCF2, #2F80ED)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >{usedSpace}</div>
      <div
        style={{
          position: 'absolute',
          zIndex: 5,
          width: sqPosition,
          height: 20,
          borderRight: `4px solid ${yellow['500']}`,
          top: 0,
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          zIndex: 5,
          width: rqPosition,
          height: 20,
          borderRight: `4px solid ${red['500']}`,
          top: 0,
        }}
      ></div>
    </div>;
  }

  render() {
    const { classes, t, user, domain, sizeUnits, handleInput, handlePropertyChange,
      handleIntPropertyChange, handleCheckbox, usernameError, handleUnitChange,
      handlePasswordChange } = this.props;
    const { username, addressStatus, properties, smtp, pop3_imap, changePassword, ldapID } = user; //eslint-disable-line
    const { language, creationtime, displaytypeex, storagequotalimit, prohibitreceivequota,
      prohibitsendquota } = properties;
    return (
      <FormControl className={classes.form}>
        <Grid container className={classes.input}>
          <TextField
            label={t("Username")}
            value={username || ''}
            autoFocus
            onChange={handleInput('username')}
            style={{ flex: 1, marginRight: 8 }}
            InputProps={{
              endAdornment: <div>@{domain.domainname}</div>,
            }}
            error={usernameError}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePasswordChange}
            size="small"
          >
            {t('Change password')}
          </Button>
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
          value={addressStatus || 0}
          onChange={handleInput('addressStatus')}
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
          <Grid container className={classes.graphContainer}>
            <Typography color="textPrimary" className={classes.quotaHeadline}>{t('Used space')}</Typography>
            {this.calculateGraph()}
          </Grid>
          <Grid container>
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
                  <FormControl>
                    <Select
                      onChange={handleUnitChange('prohibitsendquota')}
                      value={sizeUnits.prohibitsendquota}
                      className={classes.select}
                    >
                      <MenuItem value={1}>MB</MenuItem>
                      <MenuItem value={2}>GB</MenuItem>
                      <MenuItem value={3}>TB</MenuItem>
                    </Select>
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
                  <FormControl>
                    <Select
                      onChange={handleUnitChange('prohibitreceivequota')}
                      value={sizeUnits.prohibitreceivequota}
                      className={classes.select}
                    >
                      <MenuItem value={1}>MB</MenuItem>
                      <MenuItem value={2}>GB</MenuItem>
                      <MenuItem value={3}>TB</MenuItem>
                    </Select>
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
                  <FormControl>
                    <Select
                      onChange={handleUnitChange('storagequotalimit')}
                      value={sizeUnits.storagequotalimit}
                      className={classes.select}
                    >
                      <MenuItem value={1}>MB</MenuItem>
                      <MenuItem value={2}>GB</MenuItem>
                      <MenuItem value={3}>TB</MenuItem>
                    </Select>
                  </FormControl>,
              }}
            />
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
      </FormControl>
    );
  }
}

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
  usernameError: PropTypes.bool,
  rawData: PropTypes.object,
};

export default withTranslation()(withStyles(styles)(Account));
