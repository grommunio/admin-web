// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  AUTH_AUTHENTICATING,
  AUTH_AUTHENTICATED,
  AUTH_ERROR,
} from '../actions/types';

const defaultState = {
  error: false,
  authenticated: false,     
  authenticating: true,
  capabilities: [],
};

function authReducer(state = defaultState, action) {
  switch (action.type) {
    case AUTH_AUTHENTICATING:
      return {
        ...state,
        authenticating: action.authenticating,
        error: false,
      };

    case AUTH_AUTHENTICATED:
      return {
        ...state,
        authenticated: action.authenticated,
        capabilities: action.capabilities || [],
        error: false,
      };
    
    case AUTH_ERROR: {
      return {
        ...state,
        authenticated: false,
        error: action.error || true,
      };
    }

    default:
      return state;
  }
}

export default authReducer;
