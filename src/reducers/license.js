// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  LICENSE_DATA_RECEIVED,
} from '../actions/types';


const defaultState = {
};

function licenseReducer(state = defaultState, action) {
  switch (action.type) {
  case LICENSE_DATA_RECEIVED:
    return {
      ...state,
      ...action.data,
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

export default licenseReducer;
