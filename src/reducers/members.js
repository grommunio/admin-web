// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  MEMBERS_DATA_ERROR,
  MEMBERS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  error: null,
  Members: [],
};

function membersReducer(state = defaultState, action) {
  switch (action.type) {
  case MEMBERS_DATA_RECEIVED:
    return {
      ...state,
      error: null,
      Members: action.data.data,
    };
    
  case MEMBERS_DATA_ERROR: {
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

export default membersReducer;
