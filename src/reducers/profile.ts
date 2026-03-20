// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { User } from '@/types/users';
import {
  PROFILE_DATA_RECEIVED,
  AUTH_AUTHENTICATED,
} from '../actions/types';

type ProfileState = {
  Profile: {
    capabilities: string[];
    user: User;
  }
}

const defaultState: ProfileState = {
  Profile: {
    capabilities: [],
    user: {} as User,
  },
};

function profileReducer(state: ProfileState = defaultState, action) {
  switch (action.type) {
  case PROFILE_DATA_RECEIVED:
    return {
      ...state,
      Profile: action.data,
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

export default profileReducer;
