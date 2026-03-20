// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  CHANGE_SETTINGS,
} from '../actions/types';

type SettingsState = {
  language: string;
}

const defaultState: SettingsState = {
  language: 'en-US',
};

function settingsReducer(state: SettingsState = defaultState, action) {
  switch(action.type) {
  case CHANGE_SETTINGS:
    return {
      ...state,
      [action.field]: action.value,
    };

  default:
    break;
  }
  return state;
}

export default settingsReducer;
