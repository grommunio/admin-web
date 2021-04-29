// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  AUTH_AUTHENTICATED,
  LOGS_DATA_RECEIVED,
  LOGS_DATA_FETCH,
} from '../actions/types';

const defaultState = {
  loading: false,
  Logs: [],
};

function membersReducer(state = defaultState, action) {
  switch (action.type) {
    case LOGS_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case LOGS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
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
