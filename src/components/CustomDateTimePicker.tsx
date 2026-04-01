// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { Moment } from 'moment';

type CustomDateTimePickerProps = {
  onChange: (newVal: Moment | null) => void;
  label: string;
  value: Moment;
  sx?: Record<string, string | number>;
}

const CustomDateTimePicker = (props: CustomDateTimePickerProps) => {
  const { ...childProps } = props;

  return (
    (<LocalizationProvider dateAdapter={AdapterMoment}>
      <DateTimePicker
        ampm={false}
        {...childProps}
      />
    </LocalizationProvider>)
  );
}


export default CustomDateTimePicker;