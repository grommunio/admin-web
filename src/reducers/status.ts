// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  VHOST_DATA_RECEIVED,
  AUTH_AUTHENTICATED,
} from '../actions/types';

type StatusState = {
  vhosts: string[];
}

const defaultState: StatusState = {
  vhosts: [],
};

function statusReducer(state: StatusState = defaultState, action: any) {
  switch (action.type) {
  case VHOST_DATA_RECEIVED:
    return {
      ...state,
      vhosts: action.data.data,
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

export default statusReducer;
