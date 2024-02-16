// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  MEMBERS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  Members: [],
};

function membersReducer(state = defaultState, action) {
  switch (action.type) {
  case MEMBERS_DATA_RECEIVED:
    return {
      ...state,
      Members: action.data.data,
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
