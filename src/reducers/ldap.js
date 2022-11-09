// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  LDAP_DATA_RECEIVED,
  LDAP_DATA_CLEAR,
} from '../actions/types';

const defaultState = {
  Users: [],
};

function ldapReducer(state=defaultState, action) {
  switch(action.type) { 
  case LDAP_DATA_RECEIVED:
    return {
      ...state,
      Users: action.data.data,
    };

  case LDAP_DATA_CLEAR:
    return {
      ...state,
      Users: [],
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

export default ldapReducer;