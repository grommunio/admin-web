import React from 'react';
import ColorModeContext from '../ColorContext';
import PropTypes from 'prop-types';
import createCustomTheme from '../theme';
import { ThemeProvider } from '@mui/material/styles';

export default function ToggleColorMode({ children }) {
  const [mode, setMode] = React.useState(window.localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light');
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
