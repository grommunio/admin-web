// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  AUTH_ERROR,
  TOKEN_REFRESH,
} from '../actions/types';

type AuthState = {
  error: boolean;
  authenticated: boolean;
  capabilities: string[];
  csrf: string;
}

const defaultState: AuthState = {
  error: false,
  authenticated: false,
  capabilities: [],
  csrf: '',
};

export type AuthAction = {
  type: string;
  authenticated?: false;
  capabilities?: string[];
  csrf?: string;
  error?: boolean;
}

function authReducer(state: AuthState = defaultState, action: AuthAction) {
  switch (action.type) {

  case AUTH_AUTHENTICATED:
    return {
      ...state,
      authenticated: action.authenticated,
      capabilities: action.capabilities || [],
      error: false,
      csrf: action.authenticated ? action.csrf : '',
    };
    
  case AUTH_ERROR: {
    return {
      ...state,
      authenticated: false,
      error: action.error || true,
    };
  }

  case TOKEN_REFRESH:
    return {
      ...state,
      csrf: action.csrf,
    }

  default:
    return state;
  }
}

export default authReducer;
