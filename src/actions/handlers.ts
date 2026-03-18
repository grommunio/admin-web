// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { Dispatch } from "redux";

type Endpoint = (...args: any[]) => any;

export function defaultListHandler(endpoint: Endpoint, receivedActionType: string, ...endpointParams: any[]) {
  return async (dispatch: Dispatch)  => {
    try {
      const data = await dispatch(endpoint(...endpointParams));
      dispatch({ type: receivedActionType, data });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function defaultPostHandler(endpoint: Endpoint, addActionType: string, ...endpointParams: any[]) {
  return async (dispatch: Dispatch)  => {
    try {
      const resp = await dispatch(endpoint(...endpointParams));
      if(resp) dispatch({ type: addActionType, data: resp });
      return Promise.resolve(resp);
    } catch(error) {
      return Promise.reject(error.message);
    }
  };
}

export function defaultDetailsHandler(endpoint: Endpoint, ...endpointParams: any[]) {
  return async (dispatch: Dispatch)  => {
    try {
      const resp = await dispatch(endpoint(...endpointParams));
      return Promise.resolve(resp);
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function defaultPatchHandler(endpoint: Endpoint, ...endpointParams: any[]) {
  return async (dispatch: Dispatch)  => {
    try {
      const resp = await dispatch(endpoint(...endpointParams));
      return Promise.resolve(resp);
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function defaultDeleteHandler(endpoint: Endpoint, deleteActionType: string, endpointParams: Record<string, any>) {
  return async (dispatch: Dispatch) => {
    if(!endpointParams.id) {
      return Promise.reject("No entity ID received");
    }
    try {
      const resp = await dispatch(endpoint(...Object.values(endpointParams)));
      dispatch({ type: deleteActionType, ...endpointParams });
      return Promise.resolve(resp);
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
