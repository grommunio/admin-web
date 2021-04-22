// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  AUTH_AUTHENTICATED,
  FORWARDS_DATA_ERROR,
  FORWARDS_DATA_FETCH,
  FORWARDS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Forwards: [],
};

function forwardsReducer(state = defaultState, action) {
  switch (action.type) {
    case FORWARDS_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case FORWARDS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Forwards: action.data.data,
      };
    
    case FORWARDS_DATA_ERROR: {
      return {
        ...state,
        error: action.error,
        loading: false,
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
