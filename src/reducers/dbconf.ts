// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  DBCONF_DATA_RECEIVED,
  DBCONF_SERVICE_DELETE,
  DBCONF_SERVICE_ADD,
  AUTH_AUTHENTICATED,
} from '../actions/types';
import { addItem } from '../utils';

type DBConfState = {
  services: string[];
  commands: {
    key: string[];
    file: string[];
    service: string[];
  }
}

const defaultState: DBConfState = {
  services: [],
  commands: {
    key: [],
    file: [],
    service: [],
  },
};

type DBConfAction = {
  type: string;
  service?: string;
  services: string[];
  commands: {
    key: string[];
    file: string[];
    service: string[];
  };
  authenticated?: boolean;
}

function dbconfReducer(state: DBConfState = defaultState, action: DBConfAction) {
  switch (action.type) {
  case DBCONF_DATA_RECEIVED:
    return {
      ...state,
      services: action.services || state.services,
      commands: action.commands || state.commands,
    };

      
  case DBCONF_SERVICE_DELETE:
    return {
      ...state,
      services: state.services.filter(s => s !== action.service) || [],
    };

  case DBCONF_SERVICE_ADD:
    return {
      ...state,
      services: addItem<string>(state.services, action.service as string),
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
