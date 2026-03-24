// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { ReactNode } from 'react';
import { Autocomplete, TextField, TextFieldVariants } from '@mui/material';
import { getAutocompleteOptions } from '../utils';
import { useTranslation } from 'react-i18next';
import { USER_STATUS } from '../constants';


type MagnitudeAutocompleteProps<T> = {
  className?: string;
  value: T | T[];
  filterAttribute: string;
  onChange: (_: never, newVal: T | T[]) => void;
  options?: T[];
  label?: string;
  getOptionLabel?: (option: any) => string;
  inputValue?: string;
  onInputChange?: () => void;
  freeSolo?: boolean;
  multiple?: boolean;
  calculateMagnitude?: boolean;
  placeholder?: string;
  renderOption?: (props: any, option: any) => ReactNode;
  autoFocus?: boolean;
  autoSelect?: boolean;
  variant?: TextFieldVariants;
  fullWidth?: boolean;
  disabled?: boolean;
  getOptionDisabled?: (option: any) => boolean;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  disableCloseOnSelect?: boolean;
  getOptionKey?: (option: any) => string | number;
  helperText?: string;
}

function MagnitudeAutocomplete<T>(props: MagnitudeAutocompleteProps<T>) {
  const { className, value, filterAttribute, onChange, options, label, getOptionLabel,
    inputValue, onInputChange, freeSolo, multiple, calculateMagnitude, placeholder, renderOption,
    autoFocus, autoSelect, variant, fullWidth, disabled, getOptionDisabled, isOptionEqualToValue,
    disableCloseOnSelect, getOptionKey, helperText } = props;
  const { t } = useTranslation();
  const magnitude = calculateMagnitude === false ? 0 : Math.round(Math.log10(options.length) - 2);

  return <Autocomplete
    className={className}
    inputValue={inputValue}
    value={value || null}
    onChange={onChange}
    options={options || []}
    getOptionLabel={getOptionLabel || (o => {
      // Contact
      if(filterAttribute === "username" && o.status === USER_STATUS.CONTACT) {
        const properties = o.properties || {};
        return properties["smtpaddress"] || properties["displayname"] || "";
      }
      return o[filterAttribute] || '';
    })}
    filterOptions={getAutocompleteOptions(filterAttribute, magnitude)}
    noOptionsText={inputValue && inputValue.length < magnitude ?
      t('Filter more precisely') + '...' : t('No options')}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label || ''}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={onInputChange}
        variant={variant || 'outlined'}
        helperText={helperText}
      />
    )}
    renderOption={renderOption}
    getOptionKey={getOptionKey}
    freeSolo={freeSolo || false}
    multiple={multiple || false}
    autoSelect={autoSelect}
    fullWidth={fullWidth || false}
    autoHighlight
    disabled={disabled || false}
    getOptionDisabled={getOptionDisabled}
    isOptionEqualToValue={isOptionEqualToValue}
    disableCloseOnSelect={disableCloseOnSelect || multiple || false}
  />;
}


export default MagnitudeAutocomplete;
