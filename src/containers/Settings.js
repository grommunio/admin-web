// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { withTranslation } from 'react-i18next';
import { Paper, FormControl, Switch, FormLabel, TextField, MenuItem, Button, Grid } from '@mui/material';
import { connect } from 'react-redux';
import { changeSettings } from '../actions/settings';
import TableViewContainer from '../components/TableViewContainer';
import { useNavigate } from 'react-router';
import ColorModeContext from '../ColorContext';

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

const Settings = props => {
  const [state, setState] = useState({
    snackbar: '',
  });
  const context = useContext(ColorModeContext);
  const navigate = useNavigate();

  const handleDarkModeChange = event => {
    window.localStorage.setItem('darkMode', event.target.checked);
    context.toggleColorMode();
  }

  const handleThemeSelect = e => {
    const { value: colorTheme } = e.target;
    window.localStorage.setItem('colorTheme', colorTheme);
    context.setColorTheme(colorTheme);
  }

  const { classes, t, serverConfig } = props;
  const { snackbar } = state;
  const darkModeStorage = window.localStorage.getItem("darkMode");
  const darkMode = darkModeStorage === null ? serverConfig.defaultDarkMode.toString() : darkModeStorage;

  const colorTheme = window.localStorage.getItem("colorTheme") || serverConfig.defaultTheme;
  return (
    <TableViewContainer
      headline={t("Settings")}
      subtitle={t('settings_sub')}
      href="https://docs.grommunio.com/admin/administration.html#settings"
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
    >
      <Paper className={classes.paper} elevation={1}>
        <FormControl className={classes.form}>
          <FormControl className={classes.input}>
            <FormLabel component="legend">{t('Darkmode')}</FormLabel>
            <Switch
              checked={(darkMode === 'true')}
              onChange={handleDarkModeChange}
              color="primary"
            />
          </FormControl>
          <TextField
            label={t("Theme")}
            value={colorTheme}
            onChange={handleThemeSelect}
            select
            className={classes.input}
          >
            <MenuItem value="grommunio">grommunio</MenuItem>
            <MenuItem value="bluegrey">bluegrey</MenuItem>
            <MenuItem value="brown">brown</MenuItem>
            <MenuItem value="green">green</MenuItem>
            <MenuItem value="magenta">magenta</MenuItem>
            <MenuItem value="orange">orange</MenuItem>
            <MenuItem value="purple">purple</MenuItem>
            <MenuItem value="teal">teal</MenuItem>
          </TextField>
        </FormControl>
        <Grid container className={classes.buttonGrid}>
          <Button
            onClick={() => navigate(-1)}
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

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
  serverConfig: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  const { settings, config } = state;
  return {
    settings,
    serverConfig: config,
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
  withTranslation()(withStyles(Settings, styles)));
