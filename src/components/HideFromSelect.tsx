// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { UserProperties } from '@/types/users';

type HideFromSelectProps = {
  attributehidden_gromox?: number;
  setState: (innerFunc: <T extends { user: { properties: Partial<UserProperties> } }>(prev: T) => T) => void;
}

const HideFromSelect = ({ attributehidden_gromox, setState }: HideFromSelectProps) => {
  const { t } = useTranslation();

  const hiddenFrom = [
    { ID: 1, name: 'Global Address List', value: 0x01 },
    { ID: 2, name: 'Address/Member lists', value: 0x02 },
    { ID: 3, name: 'Delegate lists', value: 0x04 },
    { ID: 4, name: 'Ambiguous Name Resolution', value: 0x08 }
  ];
  
  /**
     * This method is a bit obfuscated. MUI multiselects only work with arrays.
     * However, the property `attributehidden_gromox` uses a bitmask. To merge these functionalities,
     * the array of selected values is reduced to a bitmask by bitwise-OR-ing the elements.
     * The properties state always holds this bitmask.
     * The MUI component's state expands this bitmask into 3 explicitly defined array elements, that match the bits.
     * For example, `attributehidden_gromox === 3` results in `[1, 2, 0]` for the component.
     */
  const handleMultiselectChange = (field: keyof UserProperties) => (event: SelectChangeEvent<number[]>)=> {
    const { value } = event.target;
    const mask = (typeof value === 'string' ? value.split(',').map(el => parseInt(el)) : value)
      .reduce((prev, next) => prev | next, 0);  // bitwise OR array elements
    setState((state) => ({
      ...state,
      user: {
        ...state.user,
        properties: {
          ...state.user.properties,
          [field]: mask,
        },
      },
      unsaved: true,
    }));
  };

  return <FormControl sx={{ my: 1 }} fullWidth>
    <InputLabel id="demo-multiple-name-label">{t("Hide user from…")}</InputLabel>
    <Select
      multiple
      // Transform bitmask to array elements
      value={attributehidden_gromox ? [attributehidden_gromox & 1, attributehidden_gromox & 2, attributehidden_gromox & 4, attributehidden_gromox & 8] : []}
      onChange={handleMultiselectChange('attributehidden_gromox')}
      input={<OutlinedInput label={t("Hide user from…")}/>}
    >
      {hiddenFrom.map(({ ID, name, value }) => (
        <MenuItem
          key={ID}
          value={value}
        >
          {name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
};

HideFromSelect.propTypes = {
  attributehidden_gromox: PropTypes.number,
  setState: PropTypes.func.isRequired,
}

export default HideFromSelect;