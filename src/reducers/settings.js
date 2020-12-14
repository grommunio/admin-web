// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  CHANGE_SETTINGS,
} from '../actions/types';

const defaultState = {
  language: 'en-US',
};

function settingsReducer(state = defaultState, action) {
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
