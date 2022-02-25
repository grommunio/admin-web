// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  SERVERS_DATA_ADD,
  SERVERS_DATA_DELETE,
  SERVERS_DATA_ERROR,
  SERVERS_DATA_FETCH,
  SERVERS_DATA_RECEIVED,
} from '../actions/types';
import { servers, serverDetails, addServer, editServer, deleteServer } from '../api';

export function fetchServersData(params) {
  return async dispatch => {
    await dispatch({ type: SERVERS_DATA_FETCH });
    try {
      const serversData = await dispatch(servers(params));
      await dispatch({ type: SERVERS_DATA_RECEIVED, data: serversData });
    } catch(error) {
      console.error(error);
      await dispatch({ type: SERVERS_DATA_ERROR });
      return Promise.reject(error.message);
    }
  };
}

export function fetchServerDetails(id) {
  return async dispatch => {
    try {
      const serverData = await dispatch(serverDetails(id));
      return Promise.resolve(serverData);
    } catch(error) {
      console.error(error);
      await dispatch({ type: SERVERS_DATA_ERROR });
      return Promise.reject(error.message);
    }
  };
}

export function addServerData(org) {
  return async dispatch => {
    try {
      const resp = await dispatch(addServer(org));
      await dispatch({ type: SERVERS_DATA_ADD, data: resp });
    } catch(error) {
      console.error(error);
      await dispatch({ type: SERVERS_DATA_ERROR });
      return Promise.reject(error.message);
    }
  };
}

export function editServerData(org) {
  return async dispatch => {
    try {
      await dispatch(editServer(org));
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteServerData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteServer(id));
      await dispatch({ type: SERVERS_DATA_DELETE, id });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
