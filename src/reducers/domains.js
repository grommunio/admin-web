// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  DOMAIN_DATA_RECEIVED,
  DOMAIN_DATA_ADD,
  DOMAIN_NEXT_SET,
  DOMAIN_DATA_DELETE,
  AUTH_AUTHENTICATED,
} from '../actions/types';
import { addItem, append } from '../utils';

const defaultState = {
  count: 0,
  Domains: [],
};

function deactivateDomain(arr, id) {
  // Direct array access makes redux throw up, so use a mapper instead
  const newArray = arr.map(domain => ({
    ...domain,
    domainStatus: domain.ID === id ? 3 : domain.domainStatus,
  }));

  return newArray;
}

function domainsReducer(state = defaultState, action) {
  switch (action.type) {
  case DOMAIN_DATA_RECEIVED:
    return {
      ...state,
      Domains: action.data.data,
      count: action.data.count,
    };

  case DOMAIN_NEXT_SET:
    return {
      ...state,
      Domains: append(state.Domains, action.data.data),
      count: action.data.count,
    };

  case DOMAIN_DATA_ADD:
    return {
      ...state,
      Domains: addItem(state.Domains, action.data),
      count: state.count + 1,
    };

  case DOMAIN_DATA_DELETE:
    return {
      ...state,
      Domains: action.params?.purge ? [...state.Domains].filter(domain => domain.ID !== action.id)
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
