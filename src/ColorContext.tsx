// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { ColorThemeName } from './themes/types';
import { ColorModeContextType } from './components/ToggleColorMode';

// Context to set MUI theme and darkmode
const ColorModeContext = React.createContext<ColorModeContextType>({
  toggleColorMode: () => null,
  setColorTheme: (colorTheme: ColorThemeName) => colorTheme,
  mode: 'dark',
});

export default ColorModeContext;