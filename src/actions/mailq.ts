// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { mailq, flush, deleteMailq, requeueMailq } from '../api';
import { defaultDetailsHandler } from './handlers';

export function fetchMailQData() {
  return defaultDetailsHandler(mailq);
}

export function flushMailQData(qIDs: number[]) {
  return async () => {
    try {
      qIDs.forEach(async qID => {
        await flush({ queue: qID });
      });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteMailQData(qID: number) {
  return defaultDetailsHandler(deleteMailq, qID);
}

export function requeueMailQData(qID: number) {
  return defaultDetailsHandler(requeueMailq, qID);
}
