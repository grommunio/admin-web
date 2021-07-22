// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import { status } from '../api';

export function fetchStatusData() {
  return async dispatch => {
    try {
      const response = await dispatch(status());
      return Promise.resolve(response);
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
