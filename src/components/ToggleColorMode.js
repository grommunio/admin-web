// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect } from 'react';
import ColorModeContext from '../ColorContext';
import PropTypes from 'prop-types';
import createCustomTheme from '../theme';
import { ThemeProvider } from '@mui/material/styles';
import { useSelector } from 'react-redux';


export default function ToggleColorMode({ children }) {
  const config = useSelector(state => state.config);
  const [mode, setMode] = React.useState('light');

  // Theme
  const [colorTheme, setColorTheme] = React.useState(window.localStorage.getItem("colorTheme") || config.defaultTheme);

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          window.localStorage.setItem('darkMode', prevMode === 'light' ? 'true' : 'false');
          return prevMode === 'light' ? 'dark' : 'light';
        });
      },
      setColorTheme: colorTheme => {
        window.localStorage.setItem('colorTheme', colorTheme);
        setColorTheme(colorTheme);
      },
      mode,
    }),
    [mode],
  );

  useEffect(() => {
    // Theme
    setColorTheme(window.localStorage.getItem("colorTheme") || config.defaultTheme);
    // Mode
    if(window.localStorage.getItem("darkMode") !== null) {
      setMode(window.localStorage.getItem("darkMode") === "true" ? "dark": "light");
      return;
    }
    const serverDarkMode = config.defaultDarkMode;
    const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkMode = serverDarkMode || systemDarkMode;
    setMode(darkMode ? 'dark' : 'light');

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
