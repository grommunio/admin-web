// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField } from '@mui/material';
import { getAutocompleteOptions } from '../utils';
import { withTranslation } from 'react-i18next';
import { USER_STATUS } from '../constants';

const MagnitudeAutocomplete = props => {
  const { t, className, value, filterAttribute, onChange, options, label, getOptionLabel,
    inputValue, onInputChange, freeSolo, multiple, calculateMagnitude, placeholder, renderOption,
    autoFocus, autoSelect, variant, fullWidth, disabled, getOptionDisabled, isOptionEqualToValue, disableCloseOnSelect,
    getOptionKey, helperText } = props;
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
    filterOptions={inputValue ? getAutocompleteOptions(filterAttribute, magnitude) : undefined}
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
};

MagnitudeAutocomplete.propTypes = {
  t: PropTypes.func.isRequired,
  className: PropTypes.string,
  value: PropTypes.any,
  filterAttribute: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onInputChange: PropTypes.func,
  getOptionLabel: PropTypes.func,
  renderOption: PropTypes.func,
  options: PropTypes.array,
  label: PropTypes.string,
  inputValue: PropTypes.string,
  freeSolo: PropTypes.bool,
  multiple: PropTypes.bool,
  calculateMagnitude: PropTypes.bool,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  autoSelect: PropTypes.bool,
  variant: PropTypes.string,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  isOptionEqualToValue: PropTypes.func,
  getOptionDisabled: PropTypes.func,
  disableCloseOnSelect: PropTypes.bool,
  getOptionKey: PropTypes.func,
  helperText: PropTypes.string,
};

export default withTranslation()(MagnitudeAutocomplete);
