// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  DRAWER_EXPAND,
  DRAWER_OPEN,
  DRAWER_DOMAINS_REVEICED,
  SELECT_DRAWER_DOMAIN,
  DOMAIN_DATA_ADD,
  DOMAIN_DATA_EDIT,
  DOMAIN_DATA_DELETE,
  AUTH_AUTHENTICATED,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState = {
  selectedDomain: -1,
  Domains: [],
  loading: true,
  expanded: true,
  open: false,
};

function editDomain(arr, item) {
  const domains = [...arr];
  const idx = domains.findIndex(d => d.ID === item.ID);
  if (idx === -1) return;
  domains[idx] = item;
  return domains;
}

function drawerReducer(state = defaultState, action) {
  switch (action.type) {
  case DRAWER_OPEN:
    return {
      ...state,
      open: !state.open,
    }

  case DRAWER_EXPAND:
    return {
      ...state,
      expanded: !state.expanded,
    };

  case DRAWER_DOMAINS_REVEICED:
    return {
      ...state,
      Domains: action.data.data,
      loading: false,
    };

  case DOMAIN_DATA_ADD:
    return {
      ...state,
      Domains: addItem(state.Domains, action.data),
    };

  case DOMAIN_DATA_EDIT:
    return {
      ...state,
      Domains: editDomain(state.Domains, action.data),
    };

  case DOMAIN_DATA_DELETE:
    return {
      ...state,
      Domains: [...state.Domains].filter(d => d.ID !== action.id),
    };

  case SELECT_DRAWER_DOMAIN:
    return {
      ...state,
      selectedDomain: action.id,
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

export default drawerReducer;
