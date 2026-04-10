// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { USER_TYPE } from '../types/users';
import {
  GLOBAL_USERS_FILTER_STATE
} from '../actions/types';

type GlobalUsersState = {
  match: string;
  showDeactivated: boolean;
  mode: number;
  type: number;
}

const defaultState: GlobalUsersState = {
  match: "",
  showDeactivated: false,
  mode: 0,
  type: USER_TYPE.ALL,
};


// Only used for filterstate
function globalUsersReducer(state: GlobalUsersState = defaultState, action: any) {
  switch(action.type) {

  case GLOBAL_USERS_FILTER_STATE:
    return {
      ...state,
      [action.prop]: action.value,
    };

  default: return state;

  }
}

export default globalUsersReducer;
