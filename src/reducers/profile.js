// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  PROFILE_DATA_RECEIVED,
  PROFILE_DATA_ERROR,
  AUTH_AUTHENTICATED,
} from '../actions/types';

const defaultState = {
  error: null,
  Profile: {
    capabilities: [],
    user: {},
  },
};

function profileReducer(state = defaultState, action) {
  switch (action.type) {
  case PROFILE_DATA_RECEIVED:
    return {
      ...state,
      error: null,
      Profile: action.data,
    };
    
  case PROFILE_DATA_ERROR:
    return {
      ...state,
      error: action.error,
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

export default profileReducer;
