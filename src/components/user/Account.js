import React, { PureComponent } from 'react';
import { Button, Checkbox, FormControl, FormControlLabel, Grid, MenuItem,
  Select, TextField, withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1),
  },
  select: {
    minWidth: 60,
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

  render() {
    const { classes, t, user, domain, sizeUnit, handleInput, handlePropertyChange,
      handleIntPropertyChange, handleCheckbox } = this.props;
    const { username, addressStatus, properties, smtp, pop3_imap, changePassword, ldapID } = user; //eslint-disable-line
    const { language, creationtime, displaytypeex, storagequotalimit } = properties;
    const usernameError = user.username && !user.username.match(/^([.0-9a-z_+-]+)$/);
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
            onClick={() => this.setState({ changingPw: true })}
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
          className={classes.input}
          label={t("Creation time")}
          fullWidth
          value={creationtime || ''}
          onChange={handlePropertyChange('creationtime')}
          disabled
        />
        <TextField 
          className={classes.input} 
          label={t("Storage quota limit")}
          fullWidth 
          value={storagequotalimit || ''}
          onChange={handleIntPropertyChange('storagequotalimit')}
          InputProps={{
            endAdornment:
              <FormControl>
                <Select
                  onChange={this.handleUnitChange}
                  value={sizeUnit}
                  className={classes.select}
                >
                  <MenuItem value={1}>MiB</MenuItem>
                  <MenuItem value={2}>GiB</MenuItem>
                  <MenuItem value={3}>TiB</MenuItem>
                </Select>
              </FormControl>,
          }}
        />
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
  sizeUnit: PropTypes.string.isRequired,
  handleInput: PropTypes.func.isRequired,
  handlePropertyChange: PropTypes.func.isRequired,
  handleIntPropertyChange: PropTypes.func.isRequired,
  handleCheckbox: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(Account));
