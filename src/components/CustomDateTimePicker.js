// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { InputAdornment, TextField } from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { Clear } from '@mui/icons-material';

const CustomDateTimePicker = props => {
  const { fullWidth, ...childProps } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DateTimePicker
        renderInput={(params) => <TextField
          fullWidth={fullWidth}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Clear color="secondary" />
              </InputAdornment>
            ),
          }}
          {...params}
        />}
        {...childProps}
      />
    </LocalizationProvider>
  );
}

CustomDateTimePicker.propTypes = {
  fullWidth: PropTypes.bool,
};

export default CustomDateTimePicker;