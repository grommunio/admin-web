// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import { Paper, FormControl, Switch, FormLabel, TextField, MenuItem, Button, Grid } from '@mui/material';
import { connect } from 'react-redux';
import { changeSettings } from '../actions/settings';
import i18n from '../i18n';
import TableViewContainer from '../components/TableViewContainer';
import ColorModeContext from '../ColorContext';
import config from '../config';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
  },
  form: {
    width: '100%',
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

  handleInput = field => event => {
    this.props.changeSettings(field, event.target.value);
  }

  handleDarkModeChange = event => {
    window.localStorage.setItem('darkMode', event.target.checked);
    this.context.toggleColorMode();
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

  handleThemeSelect = e => {
    const { value: colorTheme } = e.target;
    window.localStorage.setItem('colorTheme', colorTheme);
    this.context.setColorTheme(colorTheme);
  }

  render() {
    const { classes, t, history } = this.props;
    const { snackbar } = this.state;
    const darkModeStorage = window.localStorage.getItem("darkMode");
    const darkMode = darkModeStorage === null ? config.defaultDarkMode.toString() : darkModeStorage;

    const colorTheme = window.localStorage.getItem("colorTheme") || 'grommunio';
    return (
      <TableViewContainer
        headline={t("Settings")}
        subtitle={t('settings_sub')}
        href="https://docs.grommunio.com/admin/administration.html#settings"
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
      >
        <Paper className={classes.paper} elevation={1}>
          <FormControl className={classes.form}>
            <FormControl className={classes.input}>
              <FormLabel component="legend">{t('Darkmode')}</FormLabel>
              <Switch
                checked={(darkMode === 'true')}
                onChange={this.handleDarkModeChange}
                color="primary"
              />
            </FormControl>
            <TextField
              label={t("Theme")}
              value={colorTheme}
              onChange={this.handleThemeSelect}
              select
              className={classes.input}
            >
              <MenuItem value="grommunio">grommunio</MenuItem>
              <MenuItem value="green">green</MenuItem>
              <MenuItem value="magenta">magenta</MenuItem>
            </TextField>
          </FormControl>
          <Grid container className={classes.buttonGrid}>
            <Button
              onClick={history.goBack}
              style={{ marginRight: 8 }}
              color="secondary"
            >
              {t('Back')}
            </Button>
          </Grid>
        </Paper>
      </TableViewContainer>
    );
  }
}

Settings.contextType = ColorModeContext;
Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  const { settings } = state;
  return {
    settings,
  };
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
