// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import { mailq, flush, deleteMailq, requeueMailq } from '../api';
import { defaultDetailsHandler } from './handlers';

export function fetchMailQData() {
  return defaultDetailsHandler(mailq);
}

export function flushMailQData(qIDs) {
  return async dispatch => {
    try {
      qIDs.forEach(async qID => {
        await dispatch(flush({ queue: qID }));
      });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteMailQData(...endpointParams) {
  return defaultDetailsHandler(deleteMailq, ...endpointParams);
}

export function requeueMailQData(...endpointParams) {
  return defaultDetailsHandler(requeueMailq, ...endpointParams);
}
