// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import { taskq, startTaskq, stopTaskq, taskqStatus, taskDetails, taskDelete, taskCancel } from '../api';
import { defaultDetailsHandler, defaultListHandler, defaultPatchHandler } from './handlers';
import { TASK_DATA_RECEIVED, TASK_STATUS_RECEIVED } from './types';

export function fetchTaskqData(...endpointParams) {
  return defaultListHandler(taskq, TASK_DATA_RECEIVED, ...endpointParams);
}

export function fetchTaskDetails(...endpointParams) {
  return defaultDetailsHandler(taskDetails, ...endpointParams);
}

export function deleteTask(...endpointParams) {
  return defaultDetailsHandler(taskDelete, ...endpointParams);
}

export function cancelTask(...endpointParams) {
  return defaultDetailsHandler(taskCancel, ...endpointParams);
}

export function fetchTaskqStatus(...endpointParams) {
  return defaultListHandler(taskqStatus, TASK_STATUS_RECEIVED, ...endpointParams);
}

export function startTaskqServer(...endpointParams) {
  return defaultPatchHandler(startTaskq, ...endpointParams);
}

export function stopTaskqServer(...endpointParams) {
  return defaultPatchHandler(stopTaskq, ...endpointParams);
}

