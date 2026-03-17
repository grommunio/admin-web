// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { createTheme } from '@mui/material/styles';

import grommunioTheme from './grommunio';
import greenTheme from './green';
import magentaTheme from './magenta';
import purpleTheme from './purple';
import tealTheme from './teal';
import orangeTheme from './orange';
import brownTheme from './brown';
import blueGreyTheme from './blueGrey';
import { ColorThemeName, ThemeFactory, ThemeMode } from './types';

// Define material-ui theme
const createCustomTheme = (mode: ThemeMode, colorTheme: ColorThemeName) => {
  return createTheme(getThemeFromName(colorTheme)(mode));
};

/**
 * Returns the MUI theme object identified by the theme name
 * @param {string} name Name of the MUI theme
 * @returns MUI theme
 */
function getThemeFromName(name: ColorThemeName): ThemeFactory {
  switch(name) {
  case 'grommunio': return grommunioTheme;
  case 'green': return greenTheme;
  case 'magenta': return magentaTheme;
  case 'purple': return purpleTheme;
  case 'teal': return tealTheme;
  case 'orange': return orangeTheme;
  case 'brown': return brownTheme;
  case 'bluegrey': return blueGreyTheme;
  default: return grommunioTheme;
  }
}

export default createCustomTheme;
