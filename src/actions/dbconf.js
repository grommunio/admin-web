// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  DBCONF_DATA_RECEIVED,
  DBCONF_SERVICE_DELETE,
  DBCONF_SERVICE_ADD,
} from './types';
import { dbconf, commands, uploadFile, serviceFiles, serviceFile, deleteService, deleteFile,
  editFile, renameService } from '../api';
import { defaultDetailsHandler, defaultPatchHandler } from './handlers';

export function fetchDBConfData(params) {
  return async dispatch => {
    try {
      const servicesData = await dispatch(dbconf(params));
      const commandsData = await dispatch(commands(params));
      await dispatch({ type: DBCONF_DATA_RECEIVED, services: servicesData.data, commands: commandsData });
    } catch(err) {
      console.error('failed to fetch dbconf data', err); // eslint-disable-line no-console
      return Promise.reject(err.message);
    }
  };
}

export function uploadServiceFile(service, filename, file) {
  return async dispatch => {
    try {
      await dispatch(uploadFile(service, filename, file));
      await dispatch({ type: DBCONF_SERVICE_ADD, service });
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}

export function fetchServiceFiles(...endpointParams) {
  return defaultDetailsHandler(serviceFiles, ...endpointParams);
}

export function fetchServiceFile(...endpointParams) {
  return defaultDetailsHandler(serviceFile, ...endpointParams);
}

export function editServiceFile(...endpointParams) {
  return defaultPatchHandler(editFile, ...endpointParams);
}

export function renameDBService(...endpointParams) {
  return defaultPatchHandler(renameService, ...endpointParams);
}

export function deleteDBService(service) {
  return async dispatch => {
    try {
      const resp = await dispatch(deleteService(service));
      await dispatch({ type: DBCONF_SERVICE_DELETE, service });
      return Promise.resolve(resp?.message);
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}

export function deleteDBFile(service, file) {
  return async dispatch => {
    try {
      const response = await dispatch(deleteFile(service, file));
      return response?.message;
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}
