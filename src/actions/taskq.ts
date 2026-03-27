// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { taskq, startTaskq, stopTaskq, taskqStatus, taskDetails, taskDelete, taskCancel } from '../api';
import { defaultDetailsHandler, defaultListHandler, defaultPatchHandler } from './handlers';
import { TASK_DATA_RECEIVED, TASK_STATUS_RECEIVED, URLParams } from './types';

export function fetchTaskqData(params: URLParams) {
  return defaultListHandler(taskq, TASK_DATA_RECEIVED, params);
}

export function fetchTaskDetails(taskID: number) {
  return defaultDetailsHandler(taskDetails, taskID);
}

export function deleteTask(taskID: number) {
  return defaultDetailsHandler(taskDelete, taskID);
}

export function cancelTask(taskID: number) {
  return defaultDetailsHandler(taskCancel, taskID);
}

export function fetchTaskqStatus() {
  return defaultListHandler(taskqStatus, TASK_STATUS_RECEIVED);
}

export function startTaskqServer() {
  return defaultPatchHandler(startTaskq);
}

export function stopTaskqServer() {
  return defaultPatchHandler(stopTaskq);
}
