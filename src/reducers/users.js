// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  USERS_DATA_ERROR,
  USERS_DATA_FETCH,
  USERS_DATA_RECEIVED,
  USER_DATA_ADD,
  USER_DATA_EDIT,
  USER_DATA_DELETE,
  USERS_NEXT_SET,
  ORPHANED_USERS_RECEIVED,
  ORPHANS_DELETED,
  AUTH_AUTHENTICATED,
  USERS_SYNC_RECEIVED,
} from '../actions/types';
import { append } from '../utils';

const defaultState = {
  error: null,
  loading: false,
  ready: false,
  count: 0,
  Users: [],
  Orphaned: [],
  Sync: [],
};

function addUser(arr, user) {
  let copy = [...arr];
  copy.push(user);
  return copy;
}

function editUser(arr, user) {
  let copy = [...arr];
  let idx = copy.findIndex(item => item.ID === user.ID);
  copy[idx] = user;
  return copy;
}

function deleteUser(arr, id) {
  let copy = [...arr];
  copy.splice(copy.findIndex(item => item.ID === id), 1);
  return copy;
}

function usersReducer(state=defaultState, action) {
  switch(action.type) {
    case USERS_DATA_RECEIVED: 
      return {
        ...state,
        loading: false,
        Users: action.data.data,
        count: action.data.count,
      };
    
    case USERS_NEXT_SET:
      return {
        ...state,
        loading: false,
        Users: append(state.Users, action.data.data),
        count: action.data.count,
      };

    case USERS_DATA_FETCH:
      return {
        ...state,
        ready: false,
        loading: true,
      };

    case USERS_DATA_ERROR:
      return {
        ...state,
        ready: false,
        loading: false,
        error: action.error,
      };

    case USER_DATA_ADD:
      return {
        ...state,
        Users: addUser(state.Users, action.user),
      };

    case USER_DATA_EDIT:
      return {
        ...state,
        Users: editUser(state.Users, action.user),
      };

    case USER_DATA_DELETE:
      return {
        ...state,
        Users: deleteUser(state.Users, action.id),
        count: state.count - 1,
      };

    case ORPHANED_USERS_RECEIVED:
      return {
        ...state,
        Orphaned: action.data.orphaned,
      };

    case ORPHANS_DELETED:
      return {
        ...state,
        Orphaned: [],
      };

    case USERS_SYNC_RECEIVED:
      return {
        ...state,
        Sync: action.data.data,
      };

    case AUTH_AUTHENTICATED:
      return action.authenticated ? {
        ...state,
      } : {
        ...defaultState,
      };

    default: return state;

  }
}

export default usersReducer;
