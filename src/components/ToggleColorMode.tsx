// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect } from 'react';
import ColorModeContext from '../ColorContext';
import createCustomTheme from '../themes/theme';
import { ThemeProvider } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { ColorThemeName } from '@/themes/types';

// --- Types ---
type Mode = 'light' | 'dark';

interface ConfigState {
  defaultTheme: string;
  defaultDarkMode: boolean;
}

interface RootState {
  config: ConfigState;
}

interface ToggleColorModeProps {
  children: React.ReactNode;
}

export type ColorModeContextType = {
  toggleColorMode: () => void;
  setColorTheme: (colorTheme: ColorThemeName) => ColorThemeName;
  mode: Mode;
}

export default function ToggleColorMode({ children }: ToggleColorModeProps) {
  const config = useSelector((state: RootState) => state.config);

  const [mode, setMode] = React.useState<Mode>('light');

  // Theme
  const [colorTheme, setColorThemeState] = React.useState<string>(
    (window.localStorage.getItem('colorTheme') || config.defaultTheme)
  );

  const colorMode = React.useMemo<ColorModeContextType>(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'light' ? 'dark' : 'light';
          window.localStorage.setItem('darkMode', nextMode === 'dark' ? 'true' : 'false');
          return nextMode;
        });
      },
      setColorTheme: (colorTheme: ColorThemeName) => {
        window.localStorage.setItem('colorTheme', colorTheme);
        setColorThemeState(colorTheme);
        return colorTheme;
      },
      mode,
    }),
    [mode]
  );

  useEffect(() => {
    // Theme
    setColorThemeState(
      window.localStorage.getItem('colorTheme') || config.defaultTheme
    );

    // Mode
    const storedDarkMode = window.localStorage.getItem('darkMode');

    if (storedDarkMode !== null) {
      setMode(storedDarkMode === 'true' ? 'dark' : 'light');
      return;
    }

    const serverDarkMode = config.defaultDarkMode;
    const systemDarkMode =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const darkMode = serverDarkMode || systemDarkMode;
    setMode(darkMode ? 'dark' : 'light');
  }, [config]);

  const theme = React.useMemo(() => {
    return createCustomTheme(mode, colorTheme as ColorThemeName);
  }, [mode, colorTheme]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}