// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import { vhosts, vhostStatus } from '../api';
import { VHOST_DATA_RECEIVED } from './types';

export function fetchVhostsData() {
  return async dispatch => {
    try {
      const response = await dispatch(vhosts());
      await dispatch({ type: VHOST_DATA_RECEIVED, data: response });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchVhostStatusData(name) {
  return async dispatch => {
    try {
      const response = await dispatch(vhostStatus(name));
      return Promise.resolve(response);
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
