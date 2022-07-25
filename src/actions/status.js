// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import { vhosts, vhostStatus } from '../api';
import { defaultDetailsHandler, defaultListHandler } from './handlers';
import { VHOST_DATA_RECEIVED } from './types';

export function fetchVhostsData() {
  return defaultListHandler(vhosts, VHOST_DATA_RECEIVED);
}

export function fetchVhostStatusData(...endpointParams) {
  return defaultDetailsHandler(vhostStatus, ...endpointParams);
}
