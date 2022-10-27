// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';

const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  setColorTheme: (colorTheme) => colorTheme,
});

export default ColorModeContext;