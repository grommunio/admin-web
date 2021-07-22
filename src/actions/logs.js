// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import { LOGS_DATA_FETCH, LOGS_DATA_RECEIVED } from '../actions/types';
import { logs, log } from '../api';

export function fetchLogsData(params) {
  return async dispatch => {
    await dispatch({ type: LOGS_DATA_FETCH });
    try {
      const response = await dispatch(logs(params));
      await dispatch({ type: LOGS_DATA_RECEIVED, data: response });
    } catch(error) {
      console.error(error);
      return Promise.resolve(error.message);
    }
  };
}

export function fetchLogData(filename, params) {
  return async dispatch => {
    try {
      const response = await dispatch(log(filename, params));
      return Promise.resolve(response);
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
