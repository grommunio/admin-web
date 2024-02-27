// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect } from 'react';
import ColorModeContext from '../ColorContext';
import PropTypes from 'prop-types';
import createCustomTheme from '../theme';
import { ThemeProvider } from '@mui/material/styles';
import { useSelector } from 'react-redux';


export default function ToggleColorMode({ children }) {
  const config = useSelector(state => state.config);
  const darkModeStorage = window.localStorage.getItem("darkMode");
  const darkMode = darkModeStorage === null ? config.defaultDarkMode.toString() : darkModeStorage;
  const [mode, setMode] = React.useState(darkMode === 'true' ? 'dark' : 'light');

  const [colorTheme, setColorTheme] = React.useState(window.localStorage.getItem("colorTheme") || config.defaultTheme);

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      setColorTheme: colorTheme => {
        setColorTheme(colorTheme);
      },
    }),
    [],
  );

  useEffect(() => {
    const darkModeStorage = window.localStorage.getItem("darkMode");
    const darkMode = darkModeStorage === null ? config.defaultDarkMode.toString() : darkModeStorage;
    setMode(darkMode === 'true' ? 'dark' : 'light');
    setColorTheme(window.localStorage.getItem("colorTheme") || config.defaultTheme);
  }, [config]);

  const theme = React.useMemo(
    () => {
      return createCustomTheme(mode, colorTheme);
    },
    [config, mode, colorTheme],
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
