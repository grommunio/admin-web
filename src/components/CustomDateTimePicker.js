import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InputAdornment, TextField } from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Clear } from '@mui/icons-material';

class CustomDateTimePicker extends PureComponent {

  render() {
    const { fullWidth, ...childProps } = this.props;

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
}

CustomDateTimePicker.propTypes = {
  fullWidth: PropTypes.bool,
};

export default CustomDateTimePicker;