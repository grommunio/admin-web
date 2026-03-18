// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  DRAWER_EXPAND,
  DRAWER_OPEN,
  SELECT_DRAWER_DOMAIN,
  DOMAIN_DATA_EDIT
} from './types';
import { domain } from '../api';
import { defaultListHandler } from './handlers';

export function fetchDrawerDomain(...endpointParams: any[]) {
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

export function selectDrawerDomain(id: number) {
  return {
    type: SELECT_DRAWER_DOMAIN,
    id,
  };
}

