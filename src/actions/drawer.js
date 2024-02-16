// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  DRAWER_EXPAND,
  DRAWER_OPEN,
  DRAWER_DOMAINS_REVEICED,
  SELECT_DRAWER_DOMAIN,
  DOMAIN_DATA_EDIT
} from '../actions/types';
import { domain, drawerDomains } from '../api';
import { defaultListHandler } from './handlers';

export function fetchDrawerDomains() {
  return defaultListHandler(drawerDomains, DRAWER_DOMAINS_REVEICED);
}

export function fetchDrawerDomain(...endpointParams) {
  return defaultListHandler(domain, DOMAIN_DATA_EDIT,...endpointParams);
}

export function setDrawerExpansion() {
  return {
    type: DRAWER_EXPAND,
  };
}

export function setDrawerOpen() {
  return {
    type: DRAWER_OPEN,
  };
}

export function selectDrawerDomain(id) {
  return {
    type: SELECT_DRAWER_DOMAIN,
    id,
  };
}

