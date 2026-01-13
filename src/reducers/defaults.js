// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  CREATE_PARAMS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  CreateParams: {
    user: {},
    domain: {},
  },
};

function defaultsReducer(state = defaultState, action) {
  switch (action.type) {
  case CREATE_PARAMS_DATA_RECEIVED:
    return {
      ...state,
      CreateParams: action.data.data,
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

export default defaultsReducer;
