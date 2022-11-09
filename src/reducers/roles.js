// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  ROLES_DATA_RECEIVED,
  PERMISSIONS_DATA_RECEIVED,
  ROLE_DATA_ADD,
  ROLE_DATA_DELETE,
  ROLES_NEXT_SET,
  AUTH_AUTHENTICATED,
} from '../actions/types';
import { addItem, append } from '../utils';

const defaultState = {
  Roles: [],
  Permissions: [],
  count: 0,
};

function rolesReducer(state = defaultState, action) {
  switch (action.type) {
  case ROLES_DATA_RECEIVED:
    return {
      ...state,
      Roles: action.data.data,
      count: action.data.count,
    };

  case ROLES_NEXT_SET:
    return {
      ...state,
      Roles: append(state.Roles, action.data.data),
      count: action.data.count,
    };


  case PERMISSIONS_DATA_RECEIVED:
    return {
      ...state,
      Permissions: action.data.data,
    };

  case ROLE_DATA_ADD:
    return {
      ...state,
      Roles: addItem(state.Roles, action.data),
      count: state.count + 1,
    };

  case ROLE_DATA_DELETE:
    return {
      ...state,
      Roles: state.Roles.filter(role => role.ID !== action.id),
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

export default rolesReducer;
