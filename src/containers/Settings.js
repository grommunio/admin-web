import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Typography, Grid, FormControl, TextField, MenuItem, Switch, FormLabel } from '@material-ui/core';
import TopBar from '../components/TopBar';
import { connect } from 'react-redux';
import { changeSettings } from '../actions/settings';
import i18n from '../i18n';

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
});

class Settings extends Component {

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

  render() {
    const { classes, t, settings } = this.props;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Domain List"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {t('Settings')}
              </Typography>
            </Grid>
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
          </Paper>
        </div>
      </div>
    );
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { settings: state.settings };
};

const mapDispatchToProps = dispatch => {
  return {
    changeSettings: async (field, value) => {
      await dispatch(changeSettings(field, value));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Settings)));