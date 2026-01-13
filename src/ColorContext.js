// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';

// Context to set MUI theme and darkmode
const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  setColorTheme: (colorTheme) => colorTheme,
});

export default ColorModeContext;