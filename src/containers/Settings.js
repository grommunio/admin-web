import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Typography, FormControl, TextField, MenuItem, Switch, FormLabel,
  Grid, Divider, Button, Portal, Snackbar } from '@material-ui/core';
import TopBar from '../components/TopBar';
import { connect } from 'react-redux';
import { changeSettings } from '../actions/settings';
import i18n from '../i18n';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';
import { fetchLicenseData, uploadLicenseData } from '../actions/license';
import Alert from '@material-ui/lab/Alert';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
  },
  tablePaper: {
    margin: theme.spacing(3, 2),
    borderRadius: 6,
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  pageTitleSecondary: {
    color: '#aaa',
  },
  homeIcon: {
    color: blue[500],
    position: 'relative',
    top: 4,
    left: 4,
    cursor: 'pointer',
  },
  description: {
    display: 'inline-block',
    fontWeight: 500,
    width: 100,
  },
  data: {
    padding: '8px 0',
  },
  licenseContainer: {
    margin: theme.spacing(1, 0),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  upload: {
    margin: theme.spacing(0, 0, 0, 3),
  },
  headline: {
    marginRight: 8,
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
    return (
      <div className={classes.root}>
        <TopBar/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Settings")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
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
            <Grid container>
              <Typography variant="h5" className={classes.headline}>{t('License')}</Typography>
              <Button
                className={classes.upload}
                variant="contained"
                color="primary"
                onClick={this.handleUpload}
                size="small"
              >
                {t('Upload')}
              </Button>
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
              <Typography className={classes.data}>
                {license.certificate &&
                  <Button
                    variant="contained"
                    color="primary"
                    href={license.certificate}
                    download
                    size="small"
                  >
                    {t('Download')}
                  </Button>}
              </Typography>
            </Grid>
          </Paper>
          <Portal>
            <Snackbar
              open={!!snackbar}
              onClose={() => this.setState({ snackbar: '' })}
              autoHideDuration={snackbar === 'Success!' ? 1000 : 6000}
              transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
            >
              <Alert
                onClose={() => this.setState({ snackbar: '' })}
                severity={snackbar === 'Success!' ? "success" : "error"}
                elevation={6}
                variant="filled"
              >
                {snackbar}
              </Alert>
            </Snackbar>
          </Portal>
        </div>
        <input
          accept=".crt,.pem"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          ref={r => (this.imageInputRef = r)}
          onChange={this.handleUploadConfirm}
        />
      </div>
    );
  }
}

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