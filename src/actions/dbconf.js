// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  DBCONF_DATA_FETCH,
  DBCONF_DATA_RECEIVED,
  DBCONF_SERVICE_DELETE,
  DBCONF_SERVICE_ADD,
} from './types';
import { dbconf, commands, uploadFile, serviceFiles, serviceFile, deleteService, deleteFile,
  editFile, renameService } from '../api';

export function fetchDBConfData(params) {
  return async dispatch => {
    await dispatch({ type: DBCONF_DATA_FETCH });
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
    await dispatch({ type: DBCONF_DATA_FETCH });
    try {
      await dispatch(uploadFile(service, filename, file));
      await dispatch({ type: DBCONF_SERVICE_ADD, service });
    } catch(err) {
      console.error('failed to fetch dbconf data', err); // eslint-disable-line no-console
      return Promise.reject(err.message);
    }
  };
}

export function fetchServiceFiles(service) {
  return async dispatch => {
    try {
      const files = await dispatch(serviceFiles(service));
      return Promise.resolve(files);
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      return Promise.reject(err.message);
    }
  };
}

export function fetchServiceFile(service, filename) {
  return async dispatch => {
    try {
      const fileData = await dispatch(serviceFile(service, filename));
      return Promise.resolve(fileData);
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      return Promise.reject(err.message);
    }
  };
}

export function editServiceFile(service, filename, file) {
  return async dispatch => {
    try {
      await dispatch(editFile(service, filename, file));
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      return Promise.reject(err.message);
    }
  };
}

export function renameDBService(oldName, newName) {
  return async dispatch => {
    try {
      await dispatch(renameService(oldName, newName));
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      return Promise.reject(err.message);
    }
  };
}

export function deleteDBService(service) {
  return async dispatch => {
    try {
      await dispatch(deleteService(service));
      await dispatch({ type: DBCONF_SERVICE_DELETE, service });
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      return Promise.reject(err.message);
    }
  };
}

export function deleteDBFile(service, file) {
  return async dispatch => {
    try {
      await dispatch(deleteFile(service, file));
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      return Promise.reject(err.message);
    }
  };
}
