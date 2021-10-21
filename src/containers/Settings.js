// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Typography, FormControl, TextField, MenuItem, Switch, FormLabel,
  Grid, Divider, Button } from '@mui/material';
import { connect } from 'react-redux';
import { changeSettings } from '../actions/settings';
import i18n from '../i18n';
import { fetchLicenseData, uploadLicenseData } from '../actions/license';
import { SYSTEM_ADMIN_WRITE } from '../constants';
import { CapabilityContext } from '../CapabilityContext';
import TableViewContainer from '../components/TableViewContainer';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  description: {
    display: 'inline-block',
    fontWeight: 500,
    width: 200,
  },
  data: {
    padding: '8px 0',
  },
  licenseContainer: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  divider: {
    margin: theme.spacing(2, 0, 2, 0),
  },
  upload: {
    margin: theme.spacing(0, 0, 0, 1),
  },
  headline: {
    marginRight: 8,
  },
  gridItem: {
    display: 'flex',
    flex: 1,
  },
});

class Settings extends Component {

  state = {
    snackbar: '',
  }

  componentDidMount() {
    this.props.fetch()
      .catch(snackbar => this.setState({ snackbar }));
  }

  langs = [
    { ID: 'en-US', name: 'English' },
    { ID: 'de-DE', name: 'Deutsch' },
  ]

  handleInput = field => event => {
    this.props.changeSettings(field, event.target.value);
  }

  handleDarkModeChange = event => {
    window.localStorage.setItem('darkMode', event.target.checked);
    window.location.reload();
  }

  handleLangChange = event => {
    const { changeSettings } = this.props;
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    changeSettings('language', lang);
    window.localStorage.setItem('lang', lang);
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleUpload = () => {
    this.imageInputRef.click();
  }

  handleUploadConfirm = event => {
    this.props.upload(event.target.files[0])
      .then(() => this.setState({ snackbar: 'Success!' }))
      .catch(snackbar => this.setState({ snackbar }));
  }

  render() {
    const { classes, t, settings, license } = this.props;
    const { snackbar } = this.state;
    const writable = this.context.includes(SYSTEM_ADMIN_WRITE);
    return (
      <TableViewContainer
        headline={t("Settings")}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Paper className={classes.paper} elevation={1}>
          <FormControl className={classes.form}>
            <TextField
              select
              className={classes.input}
              label={t("Language")}
              fullWidth
              value={settings.language || 'en-US'}
              onChange={this.handleLangChange}
            >
              {this.langs.map((lang, key) => (
                <MenuItem key={key} value={lang.ID}>
                  {lang.name}
                </MenuItem>
              ))}
            </TextField>
            <FormControl className={classes.formControl}>
              <FormLabel component="legend">{t('Darkmode')}</FormLabel>
              <Switch
                checked={(window.localStorage.getItem('darkMode') === 'true')}
                onChange={this.handleDarkModeChange}
                color="primary"
              />
            </FormControl>
          </FormControl>
          <Divider className={classes.divider}/>
          <Grid container alignItems="center">
            <Grid item className={classes.gridItem}>
              <Typography variant="h5" className={classes.headline}>{t('License')}</Typography>
              {writable && <Button
                className={classes.upload}
                variant="contained"
                color="primary"
                onClick={this.handleUpload}
                size="small"
              >
                {t('Upload')}
              </Button>}
            </Grid>
            {writable && <Typography variant="body2">{t("Don't have a license?")}</Typography>}
            {writable && <Button
              className={classes.upload}
              variant="contained"
              color="primary"
              href="https://grammm.com/produkte/"
              target="_blank"
              size="small"
            >
              {t('Buy now')}
            </Button>}
          </Grid>
          <Grid container direction="column" className={classes.licenseContainer}>
            <Typography className={classes.data}>
              <span className={classes.description}>{t('Product')}:</span>
              {license.product}
            </Typography>
            <Typography className={classes.data}>
              <span className={classes.description}>{t('Created')}:</span>
              {license.notBefore}
            </Typography>
            <Typography className={classes.data}>
              <span className={classes.description}>{t('Expires')}:</span>
              {license.notAfter}
            </Typography>
            <Typography className={classes.data}>
              <span className={classes.description}>{t('Users')}:</span>
              {license.currentUsers}
            </Typography>
            <Typography className={classes.data}>
              <span className={classes.description}>{t('Max users')}:</span>
              {license.maxUsers}
            </Typography>
          </Grid>
        </Paper>
        <input
          accept=".crt,.pem"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          ref={r => (this.imageInputRef = r)}
          onChange={this.handleUploadConfirm}
        />
      </TableViewContainer>
    );
  }
}

Settings.contextType = CapabilityContext;
Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  license: PropTypes.object.isRequired,
  upload: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { settings, license } = state;
  return {
    settings,
    license: license.License,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => await dispatch(fetchLicenseData())
      .catch(err => Promise.reject(err)),
    changeSettings: async (field, value) => {
      await dispatch(changeSettings(field, value));
    },
    upload: async license => await dispatch(uploadLicenseData(license))
      .catch(err => Promise.reject(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Settings)));
