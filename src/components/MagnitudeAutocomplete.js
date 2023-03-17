// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField } from '@mui/material';
import { getAutocompleteOptions } from '../utils';
import { withTranslation } from 'react-i18next';

const MagnitudeAutocomplete = props => {
  const { t, className, value, filterAttribute, onChange, options, label, getOptionLabel,
    inputValue, onInputChange, freeSolo, multiple, calculateMagnitude, placeholder, renderOption,
    autoFocus, autoSelect, variant, fullWidth, disabled, getOptionDisabled, isOptionEqualToValue } = props;
  const magnitude = calculateMagnitude === false ? 0 : Math.round(Math.log10(options.length) - 2);

  return <Autocomplete
    className={className}
    inputValue={inputValue}
    value={value}
    onChange={onChange}
    options={options || []}
    getOptionLabel={getOptionLabel || (o => o[filterAttribute] || '')}
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
      />
    )}
    renderOption={renderOption}
    freeSolo={freeSolo || false}
    multiple={multiple || false}
    autoSelect={autoSelect}
    fullWidth={fullWidth || false}
    autoHighlight
    disabled={disabled || false}
    getOptionDisabled={getOptionDisabled}
    isOptionEqualToValue={isOptionEqualToValue}
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
};

export default withTranslation()(MagnitudeAutocomplete);
