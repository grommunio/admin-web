// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  SERVICES_DATA_RECEIVED,
  AUTH_AUTHENTICATED,
} from '../actions/types';

const defaultState = {
  Services: [],
};

function domainsReducer(state = defaultState, action) {
  switch (action.type) {
  case SERVICES_DATA_RECEIVED:
    return {
      ...state,
      Services: action.data.services,
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
