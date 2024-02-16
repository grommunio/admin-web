// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  SERVERS_DATA_ADD,
  SERVERS_DATA_DELETE,
  SERVERS_DATA_RECEIVED,
  SERVERS_POLICY_RECEIVED,
  SERVER_DNS_CHECK,
} from '../actions/types';
import { servers, serverDetails, addServer, editServer, deleteServer, serversPolicy, editServerPolicy, serverDnsCheck } from '../api';
import { defaultDeleteHandler, defaultDetailsHandler, defaultListHandler, defaultPatchHandler,
  defaultPostHandler } from './handlers';

export function fetchServersData(params) {
  return async dispatch => {
    try {
      const serversData = await dispatch(servers(params));
      await dispatch({ type: SERVERS_DATA_RECEIVED, data: serversData, offset: params?.offset });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchServerDetails(...endpointParams) {
  return defaultDetailsHandler(serverDetails, ...endpointParams);
}

export function addServerData(...endpointParams) {
  return defaultPostHandler(addServer, SERVERS_DATA_ADD, ...endpointParams);
}

export function editServerData(...endpointParams) {
  return defaultPatchHandler(editServer, ...endpointParams);
}

export function deleteServerData(id) {
  return defaultDeleteHandler(deleteServer, SERVERS_DATA_DELETE, {id});
}

export function fetchServerPolicy() {
  return defaultListHandler(serversPolicy, SERVERS_POLICY_RECEIVED);
}

export function fetchServerDnsCheck() {
  return defaultListHandler(serverDnsCheck, SERVER_DNS_CHECK);
}

export function patchServerPolicy(data) {
  return async dispatch => {
    try {
      await dispatch(editServerPolicy(data));
      await dispatch({ type: SERVERS_POLICY_RECEIVED, data: data });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
