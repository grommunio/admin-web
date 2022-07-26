// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  DBCONF_DATA_FETCH,
  DBCONF_DATA_RECEIVED,
  DBCONF_SERVICE_DELETE,
  DBCONF_SERVICE_ADD,
  AUTH_AUTHENTICATED,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState = {
  loading: false,
  services: [],
  commands: {
    key: [],
    file: [],
    service: [],
  },
};

function dbconfReducer(state = defaultState, action) {
  switch (action.type) {
  case DBCONF_DATA_FETCH:
    return {
      ...state,
      loading: true,
    };

  case DBCONF_DATA_RECEIVED:
    return {
      ...state,
      loading: false,
      services: action.services,
      commands: action.commands,
    };

      
  case DBCONF_SERVICE_DELETE:
    return {
      ...state,
      services: state.services.filter(s => s !== action.service),
    };

  case DBCONF_SERVICE_ADD:
    return {
      ...state,
      services: addItem(state.services, action.service),
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

export default dbconfReducer;
