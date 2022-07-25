// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import { LOGS_DATA_FETCH, LOGS_DATA_RECEIVED } from '../actions/types';
import { logs, log } from '../api';
import { defaultDetailsHandler, defaultListHandler } from './handlers';

export function fetchLogsData(...endpointParams) {
  return defaultListHandler(logs, LOGS_DATA_RECEIVED, LOGS_DATA_FETCH, ...endpointParams);
}

export function fetchLogData(...endpointParams) {
  return defaultDetailsHandler(log, ...endpointParams);
}
