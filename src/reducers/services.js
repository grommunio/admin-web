// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  SERVICES_DATA_RECEIVED,
  SERVICES_DATA_ERROR,
  AUTH_AUTHENTICATED,
} from '../actions/types';

const defaultState = {
  error: null,
  Services: [],
};

function domainsReducer(state = defaultState, action) {
  switch (action.type) {
  case SERVICES_DATA_RECEIVED:
    return {
      ...state,
      error: null,
      Services: action.data.services,
    };
  
  case SERVICES_DATA_ERROR:
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

export default domainsReducer;
