// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  DRAWER_EXPAND,
  DRAWER_DOMAINS_REVEICED,
  SELECT_DRAWER_DOMAIN,
} from '../actions/types';
import { drawerDomains } from '../api';

export function fetchDrawerDomains() {
  return async dispatch => {
    try {
      const domains = await dispatch(drawerDomains());
      await dispatch({ type: DRAWER_DOMAINS_REVEICED, data: domains });
    } catch (err) {
      console.error('Failed to fetch domains', err);
      return Promise.reject(err.message);
    }
  };
}

export function setDrawerExpansion() {
  return {
    type: DRAWER_EXPAND,
  };
}

export function selectDrawerDomain(id) {
  return {
    type: SELECT_DRAWER_DOMAIN,
    id,
  };
}

