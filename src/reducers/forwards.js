// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  FORWARDS_DATA_ERROR,
  FORWARDS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  error: null,
  Forwards: [],
};

function forwardsReducer(state = defaultState, action) {
  switch (action.type) {
  case FORWARDS_DATA_RECEIVED:
    return {
      ...state,
      error: null,
      Forwards: action.data.data,
    };
    
  case FORWARDS_DATA_ERROR: {
    return {
      ...state,
      error: action.error,
    };
  }

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

export default forwardsReducer;
