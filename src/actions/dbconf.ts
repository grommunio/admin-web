// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  DBCONF_DATA_RECEIVED,
  DBCONF_SERVICE_DELETE,
  DBCONF_SERVICE_ADD,
  URLParams,
} from './types';
import { dbconf, commands, uploadFile, serviceFiles, serviceFile, deleteService, deleteFile,
  editFile, renameService } from '../api';
import { defaultDetailsHandler, defaultPatchHandler } from './handlers';
import { Dispatch } from 'redux';
import { ApiError } from '@/types/common';


export function fetchDBConfData(params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const servicesData = await dbconf(params);
      const commandsData = await commands(params);
      dispatch({ type: DBCONF_DATA_RECEIVED, services: servicesData.data, commands: commandsData });
    } catch(err) {
      console.error('failed to fetch dbconf data', err);
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function uploadServiceFile(service: string, filename: string, file: Record<string, any>) {
  return async (dispatch: Dispatch) => {
    try {
      await uploadFile(service, filename, file);
      dispatch({ type: DBCONF_SERVICE_ADD, service });
    } catch(err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function fetchServiceFiles(service: string) {
  return defaultDetailsHandler(serviceFiles, service);
}

export function fetchServiceFile(service: string, filename: string) {
  return defaultDetailsHandler(serviceFile, service, filename);
}

export function editServiceFile(service: string, filename: string, file: { data: Record<string, string> }) {
  return defaultPatchHandler(editFile, service, filename, file);
}

export function renameDBService(service: string, filename: string) {
  return defaultPatchHandler(renameService, service, filename);
}

export function deleteDBService(service: string) {
  return async (dispatch: Dispatch) => {
    try {
      const resp = await deleteService(service);
      dispatch({ type: DBCONF_SERVICE_DELETE, service });
      return Promise.resolve(resp?.message);
    } catch(err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function deleteDBFile(service: string, file: string) {
  return async () => {
    try {
      const response = await deleteFile(service, file);
      return response?.message;
    } catch(err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}
