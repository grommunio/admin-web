// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  LDAP_DATA_ERROR,
  LDAP_DATA_FETCH,
  LDAP_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Users: [],
};

function ldapReducer(state=defaultState, action) {
  switch(action.type) {
    case LDAP_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };
    
    case LDAP_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Users: action.data.data,
      };

    case LDAP_DATA_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
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