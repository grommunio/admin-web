// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { UserListItem } from '@/types/users';
import {
  AUTH_AUTHENTICATED,
  LDAP_DATA_RECEIVED,
  LDAP_DATA_CLEAR,
} from '../actions/types';

type LdapState = {
  Users: UserListItem[];
}

const defaultState: LdapState = {
  Users: [],
};

function ldapReducer(state: LdapState = defaultState, action) {
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