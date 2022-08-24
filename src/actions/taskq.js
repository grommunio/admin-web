// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import { taskq, startTaskq, stopTaskq, taskqStatus, taskDetails } from '../api';
import { defaultDetailsHandler, defaultListHandler, defaultPatchHandler } from './handlers';
import { TASK_DATA_RECEIVED, TASK_STATUS_RECEIVED } from './types';

export function fetchTaskqData(...endpointParams) {
  return defaultListHandler(taskq, TASK_DATA_RECEIVED, null, ...endpointParams);
}

export function fetchTaskDetails(...endpointParams) {
  return defaultDetailsHandler(taskDetails, ...endpointParams);
}

export function fetchTaskqStatus(...endpointParams) {
  return defaultListHandler(taskqStatus, TASK_STATUS_RECEIVED, null, ...endpointParams);
}

export function startTaskqServer(...endpointParams) {
  return defaultPatchHandler(startTaskq, ...endpointParams);
}

export function stopTaskqServer(...endpointParams) {
  return defaultPatchHandler(stopTaskq, ...endpointParams);
}
