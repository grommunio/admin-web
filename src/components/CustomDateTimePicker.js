import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

class CustomDateTimePicker extends PureComponent {

  render() {
    const { fullWidth, ...childProps } = this.props;

    return (
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DateTimePicker
          renderInput={(params) => <TextField fullWidth={fullWidth} {...params} />}
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