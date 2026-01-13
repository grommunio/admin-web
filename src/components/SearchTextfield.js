// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import { Search } from '@mui/icons-material';

const SearchTextfield = ({ ...childProps }) =>
  <TextField
    {...childProps}
    color="primary"
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <Search color="secondary" />
          </InputAdornment>
        ),
      }
    }}
  />;

export default withStyles(SearchTextfield, {});