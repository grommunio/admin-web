// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  DBCONF_DATA_FETCH,
  DBCONF_DATA_RECEIVED,
} from './types';
import { dbconf, commands, uploadFile } from '../api';

export function fetchDBConfData(params) {
  return async dispatch => {
    await dispatch({ type: DBCONF_DATA_FETCH });
    try {
      const servicesData = await dispatch(dbconf(params));
      const commandsData = await dispatch(commands(params));
      await dispatch({ type: DBCONF_DATA_RECEIVED, services: servicesData.data, commands: commandsData });
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      return Promise.reject(err.message);
    }
  };
}

export function uploadServiceFile(service, filename, file) {
  return async dispatch => {
    await dispatch({ type: DBCONF_DATA_FETCH });
    try {
      await dispatch(uploadFile(service, filename, file));
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      return Promise.reject(err.message);
    }
  };
}
