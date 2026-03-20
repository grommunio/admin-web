// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  LOGS_DATA_RECEIVED,
} from '../actions/types';

type LogsState = {
  Logs: string[];
}

const defaultState: LogsState = {
  Logs: [],
};

function membersReducer(state: LogsState = defaultState, action) {
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
