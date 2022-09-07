// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  DRAWER_EXPAND,
  DRAWER_OPEN,
  DRAWER_DOMAINS_REVEICED,
  SELECT_DRAWER_DOMAIN,
} from '../actions/types';
import { drawerDomains } from '../api';
import { defaultListHandler } from './handlers';

export function fetchDrawerDomains() {
  return defaultListHandler(drawerDomains, DRAWER_DOMAINS_REVEICED);
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

