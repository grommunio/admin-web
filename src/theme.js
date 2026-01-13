/* eslint-disable max-len */
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { createTheme } from '@mui/material/styles';

import grommunioTheme from './themes/grommunio';
import greenTheme from './themes/green';
import magentaTheme from './themes/magenta';
import purpleTheme from './themes/purple';
import tealTheme from './themes/teal';
import orangeTheme from './themes/orange';
import brownTheme from './themes/brown';
import blueGreyTheme from './themes/blueGrey';

// Define material-ui theme
const createCustomTheme = (mode, colorTheme) => {
  return createTheme(getThemeFromName(colorTheme)(mode));
};

/**
 * Returns the MUI theme object identified by the theme name
 * @param {string} name Name of the MUI theme
 * @returns MUI theme
 */
function getThemeFromName(name) {
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
