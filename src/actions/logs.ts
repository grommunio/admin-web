// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { LOGS_DATA_RECEIVED, URLParams } from './types';
import { logs, log, updateLog } from '../api';
import { defaultDetailsHandler, defaultListHandler } from './handlers';
import { LogURLParams } from '@/types/logs';

export function fetchLogsData(params: URLParams) {
  return defaultListHandler(logs, LOGS_DATA_RECEIVED, params);
}

export function fetchLogData(filename: string, params: LogURLParams) {
  return defaultDetailsHandler(log, filename, params);
}

export function fetchUpdateLogData(pid: string) {
  return defaultDetailsHandler(updateLog, pid);
}
