// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  LOGS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  Logs: [],
};

function membersReducer(state = defaultState, action) {
  switch (action.type) {
  case LOGS_DATA_RECEIVED:
    return {
      ...state,
      Logs: action.data.data,
    };

  case AUTH_AUTHENTICATED:
    return action.authenticated ? {
      ...state,
    } : {
      ...defaultState,
    };

  default:
    return state;
  }
}

export default membersReducer;
