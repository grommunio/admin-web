// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  DOMAIN_DATA_FETCH,
  DOMAIN_DATA_RECEIVED,
  DOMAIN_DATA_ERROR,
  DOMAIN_DATA_ADD,
  DOMAIN_NEXT_SET,
  DOMAIN_DATA_DELETE,
  AUTH_AUTHENTICATED,
} from '../actions/types';
import { addItem, append } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  count: 0,
  Domains: [],
};

function deactivateDomain(arr, id) {
  const domains = [...arr];
  const idx = domains.findIndex(d => d.ID === id);
  if (idx === -1) return;
  domains[idx].domainStatus = 3;
  return domains;
}

function domainsReducer(state = defaultState, action) {
  switch (action.type) {
  case DOMAIN_DATA_FETCH:
    return {
      ...state,
      loading: true,
    };

  case DOMAIN_DATA_RECEIVED:
    return {
      ...state,
      loading: false,
      error: null,
      Domains: action.data.data,
      count: action.data.count,
    };

  case DOMAIN_NEXT_SET:
    return {
      ...state,
      loading: false,
      error: null,
      Domains: append(state.Domains, action.data.data),
      count: action.data.count,
    };
    
  case DOMAIN_DATA_ERROR:
    return {
      ...state,
      error: action.error,
      loading: false,
    };

  case DOMAIN_DATA_ADD:
    return {
      ...state,
      Domains: addItem(state.Domains, action.data),
    };

  case DOMAIN_DATA_DELETE:
    return {
      ...state,
      Domains: action.purge ? state.Domains.filter(domain => domain.ID !== action.id)
        : deactivateDomain(state.Domains, action.id),
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

export default domainsReducer;
