// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { LOGS_DATA_RECEIVED } from '../actions/types';
import { logs, log, updateLog } from '../api';
import { defaultDetailsHandler, defaultListHandler } from './handlers';

export function fetchLogsData(...endpointParams) {
  return defaultListHandler(logs, LOGS_DATA_RECEIVED, ...endpointParams);
}

export function fetchLogData(...endpointParams) {
  return defaultDetailsHandler(log, ...endpointParams);
}

export function fetchUpdateLogData(...endpointParams) {
  return defaultDetailsHandler(updateLog, ...endpointParams);
}
