// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  USERS_DATA_ERROR,
  USERS_DATA_FETCH,
  USERS_DATA_RECEIVED,
  USER_DATA_ADD,
  USER_DATA_EDIT,
  USER_DATA_DELETE,
} from '../actions/types';

const defaultState = {
  error: null,
  loading: false,
  ready: false,

  Users: [],
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
      };

    default: return state;

  }
}

export default usersReducer;
