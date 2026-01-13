// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  GROUPS_DATA_RECEIVED,
  GROUP_DATA_ADD,
  GROUP_DATA_DELETE,
} from '../actions/types';
import { addItem, append } from '../utils';

const defaultState = {
  Groups: [],
  count: 0,
};

function groupsReducer(state = defaultState, action) {
  switch (action.type) {
  case GROUPS_DATA_RECEIVED:
    return {
      ...state,
      Groups: action.offset ? append(state.Groups, action.data.data) : action.data.data,
      count: action.data.count,
    };

  case GROUP_DATA_ADD:
    return {
      ...state,
      Groups: addItem(state.Groups, action.data),
      count: state.count - 1,
    };

  case GROUP_DATA_DELETE:
    return {
      ...state,
      Groups: state.Groups.filter(ml => ml.ID !== action.id),
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

export default groupsReducer;
