// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';
import ColorModeContext from '../ColorContext';
import PropTypes from 'prop-types';
import createCustomTheme from '../theme';
import { ThemeProvider } from '@mui/material/styles';
import config from '../config';

export default function ToggleColorMode({ children }) {
  const darkModeStorage = window.localStorage.getItem("darkMode");
  const darkMode = darkModeStorage === null ? config.defaultDarkMode.toString() : darkModeStorage;
  const [mode, setMode] = React.useState(darkMode === 'true' ? 'dark' : 'light');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () => createCustomTheme(mode),
    [mode],
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
