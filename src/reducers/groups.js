// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  GROUPS_DATA_RECEIVED,
  GROUPS_DATA_FETCH,
  GROUPS_DATA_ERROR,
  GROUP_DATA_DELETE,
  GROUP_DATA_EDIT,
  GROUP_DATA_ADD,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState={
  ready: false,
  loading: false,
  error: null,

  // Minimal data required to render group view in sane state.
  Groups: [],
  count: 0,
};

function editGroup(state, data) {
  let newArr = state;
  for(let i = 0; i < newArr.length; i++) {
    if(newArr[i].ID === data.id) {
      newArr[i].name = data.newValue;
    }
  }
  return newArr;
}

function groupsReducer(state = defaultState, action) {
  switch (action.type) {
    case GROUPS_DATA_FETCH:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GROUPS_DATA_RECEIVED:
      return {
        ...state,
        ready: true,
        loading: false,
        error: null,
        Groups: action.data.data,
        count: action.data.count,
      };

    case GROUPS_DATA_ERROR:
      return {
        ...state,
        ready: false,
        loading: false,
        error: action.err,
      };

    case GROUP_DATA_DELETE:
      return {
        ...state,
        Groups: state.Groups.filter(group => group.ID !== action.data),
        count: state.count - 1,
      };

    case GROUP_DATA_EDIT:
      return {
        ...state,
        Groups: editGroup(state.Groups, action.data),
      };

    case GROUP_DATA_ADD:
      return {
        ...state,
        Groups: addItem(state.Groups, action.data),
      };
    
    default:
      break;
  }

  return state;
}

export default groupsReducer;
