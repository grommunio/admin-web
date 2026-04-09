// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { BaseUser, UserListItem } from '@/types/users';
import {
  USERS_DATA_RECEIVED,
  USER_DATA_ADD,
  USER_DATA_DELETE,
  USERS_NEXT_SET,
  ORPHANED_USERS_RECEIVED,
  ORPHANS_DELETED,
  AUTH_AUTHENTICATED,
  USERS_SYNC_RECEIVED,
  USERS_FILTER_STATE
} from '../actions/types';
import { addItem, append } from '../utils';
import { USER_TYPE } from '../constants';

type UsersState = {
  count: number;
  Users: UserListItem[];
  Orphaned: BaseUser[]; // TODO: Might require new type
  Sync: string[];
  match: string;
  showDeactivated: boolean;
  mode: number;
  type: number;
}

const defaultState: UsersState = {
  count: 0,
  Users: [],
  Orphaned: [],
  Sync: [],

  match: "",
  showDeactivated: false,
  mode: 0,
  type: USER_TYPE.ALL,
};

function deleteUser(arr: UserListItem[], id: number) {
  const copy = [...arr];
  copy.splice(copy.findIndex(item => item.ID === id), 1);
  return copy;
}

function deleteOrphanedUsers(arr: (BaseUser | UserListItem)[], users: BaseUser[]) {
  const copy = [...arr];
  users.forEach(user => {
    copy.splice(copy.findIndex(item => item.ID === user.ID), 1);
  });
  return copy;
}

function usersReducer(state=defaultState, action: any) {
  switch(action.type) {
  case USERS_DATA_RECEIVED: 
    return {
      ...state,
      Users: action.data.data,
      count: action.data.count,
    };
  
  case USERS_NEXT_SET:
    return {
      ...state,
      Users: append(state.Users, action.data.data),
      count: action.data.count,
    };

  case USER_DATA_ADD:
    return {
      ...state,
      Users: addItem(state.Users, action.data),
      count: state.count + 1,
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
      Orphaned: deleteOrphanedUsers(state.Orphaned, action.deletedIDs),
      Users: deleteOrphanedUsers(state.Users, action.deletedIDs),
      count: state.count - action.deletedIDs.length
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

  case USERS_FILTER_STATE:
    return {
      ...state,
      [action.prop]: action.value,
    };

  default: return state;

  }
}

export default usersReducer;
