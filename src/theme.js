/* eslint-disable max-len */
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import { createTheme } from '@mui/material/styles';

import blue from './colors/blue';
import grommunioTheme from './themes/grommunio';
import greenTheme from './themes/green';

// Define material-ui theme
const createCustomTheme = (mode, colorTheme) => {
  return createTheme(getThemeFromName(colorTheme)(mode));
};

function getThemeFromName(name) {
  switch(name) {
  case 'grommunio': return grommunioTheme;
  case 'green': return greenTheme;
  default: return blue;
  }
}

export default createCustomTheme;
