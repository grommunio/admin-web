// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  MLISTS_DATA_RECEIVED,
  MLIST_DATA_ADD,
  MLIST_DATA_DELETE,
} from '../actions/types';
import { addItem, append } from '../utils';

const defaultState = {
  MLists: [],
  count: 0,
};

function mlistsReducer(state = defaultState, action) {
  switch (action.type) {
  case MLISTS_DATA_RECEIVED:
    return {
      ...state,
      MLists: action.offset ? append(state.MLists, action.data.data) : action.data.data,
      count: action.data.count,
    };

  case MLIST_DATA_ADD:
    return {
      ...state,
      MLists: addItem(state.MLists, action.data),
    };

  case MLIST_DATA_DELETE:
    return {
      ...state,
      MLists: state.MLists.filter(ml => ml.ID !== action.id),
      count: state.count - 1,
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

export default mlistsReducer;
