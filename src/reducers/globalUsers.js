// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  GLOBAL_USERS_FILTER_STATE
} from '../actions/types';

const defaultState = {
  match: "",
  showDeactivated: false,
  mode: 0,
  type: 0,
};


// Only used for filterstate
function globalUsersReducer(state=defaultState, action) {
  switch(action.type) {

  case GLOBAL_USERS_FILTER_STATE:
    return {
      ...state,
      [action.prop]: action.value,
    };

  default: return state;

  }
}

export default globalUsersReducer;
