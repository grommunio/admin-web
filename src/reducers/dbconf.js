// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  DBCONF_DATA_FETCH,
  DBCONF_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  services: [],
  commands: {},
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

    default:
      return state;
  }
}

export default dbconfReducer;
