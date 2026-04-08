// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  SERVERS_DATA_ADD,
  SERVERS_DATA_DELETE,
  SERVERS_DATA_RECEIVED,
  SERVERS_POLICY_RECEIVED,
  SERVER_DNS_CHECK,
  URLParams,
} from './types';
import { servers, serverDetails, addServer, editServer, deleteServer, serversPolicy, editServerPolicy, serverDnsCheck, serverUsers, serverDomains } from '../api';
import { defaultDeleteHandler, defaultDetailsHandler, defaultListHandler, defaultPatchHandler,
  defaultPostHandler } from './handlers';
import { Dispatch } from 'redux';
import { NewServer, ServerPolicy, UpdateServer } from '@/types/servers';
import { ApiError } from '@/types/common';


export function fetchServersData(params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const serversData = await servers(params);
      dispatch({ type: SERVERS_DATA_RECEIVED, data: serversData, offset: params?.offset });
    } catch(error) {
      console.error(error);
      const message = (error as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function fetchServerDetails(serverID: number) {
  return defaultDetailsHandler(serverDetails, serverID);
}

export function fetchServerUsers(serverID: number) {
  return defaultDetailsHandler(serverUsers, serverID);
}

export function fetchServerDomains(serverID: number) {
  return defaultDetailsHandler(serverDomains, serverID);
}

export function addServerData(server: NewServer) {
  return defaultPostHandler(addServer, SERVERS_DATA_ADD, server);
}

export function editServerData(server: UpdateServer) {
  return defaultPatchHandler(editServer, server);
}

export function deleteServerData(id: number) {
  return defaultDeleteHandler(deleteServer, SERVERS_DATA_DELETE, {id});
}

export function fetchServerPolicy() {
  return defaultListHandler(serversPolicy, SERVERS_POLICY_RECEIVED);
}

export function fetchServerDnsCheck() {
  return defaultListHandler(serverDnsCheck, SERVER_DNS_CHECK);
}

export function patchServerPolicy(data: { data: { policy: ServerPolicy } }) {
  return async (dispatch: Dispatch) => {
    try {
      await editServerPolicy(data);
      dispatch({ type: SERVERS_POLICY_RECEIVED, data: data });
    } catch(error) {
      console.error(error);
      const message = (error as ApiError).message;
      return Promise.reject(message);
    }
  };
}
