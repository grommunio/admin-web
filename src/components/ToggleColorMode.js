// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';
import ColorModeContext from '../ColorContext';
import PropTypes from 'prop-types';
import createCustomTheme from '../theme';
import { ThemeProvider } from '@mui/material/styles';
import { config } from '../config';

export default function ToggleColorMode({ children }) {
  const darkModeStorage = window.localStorage.getItem("darkMode");
  const darkMode = darkModeStorage === null ? config.defaultDarkMode.toString() : darkModeStorage;
  const [mode, setMode] = React.useState(darkMode === 'true' ? 'dark' : 'light');

  const [colorTheme, setColorTheme] = React.useState(window.localStorage.getItem("colorTheme") || 'grommunio');

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      setColorTheme: colorTheme => {
        setColorTheme(colorTheme)
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () => createCustomTheme(mode, colorTheme),
    [mode, colorTheme],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ToggleColorMode.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
}
