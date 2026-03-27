// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { Paper, FormControl, Switch, FormLabel, TextField, MenuItem, Button, Grid2, Theme } from '@mui/material';
import TableViewContainer from '../components/TableViewContainer';
import { useNavigate } from 'react-router';
import ColorModeContext from '../ColorContext';
import { useAppSelector } from '../store';
import { ChangeEvent } from '@/types/common';
import { ColorThemeName } from '@/themes/types';


const useStyles = makeStyles()((theme: Theme) => ({
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
  headline: {
    marginRight: 8,
  },
}));

const Settings = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const serverConfig = useAppSelector(state => state.config);
  const [state, setState] = useState({
    snackbar: '',
  });
  const context = useContext(ColorModeContext);
  const navigate = useNavigate();

  const handleDarkModeChange = () => {
    context.toggleColorMode();
  }

  const handleThemeSelect = (e: ChangeEvent) => {
    const { value: colorTheme } = e.target;
    context.setColorTheme(colorTheme as ColorThemeName);
  }

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
        <Grid2 container>
          <Button
            onClick={() => navigate(-1)}
            style={{ marginRight: 8 }}
            color="secondary"
          >
            {t('Back')}
          </Button>
        </Grid2>
      </Paper>
    </TableViewContainer>
  );
}


export default Settings;
