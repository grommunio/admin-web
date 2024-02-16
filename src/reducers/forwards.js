// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  FORWARDS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  Forwards: [],
};

function forwardsReducer(state = defaultState, action) {
  switch (action.type) {
  case FORWARDS_DATA_RECEIVED:
    return {
      ...state,
      Forwards: action.data.data,
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

export default forwardsReducer;
