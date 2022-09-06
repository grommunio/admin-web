// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

export function defaultListHandler(endpoint, receivedActionType, fetchActionType, ...endpointParams) {
  return async dispatch => {
    if(fetchActionType) {
      await dispatch({ type: fetchActionType });
    }
    try {
      const data = await dispatch(endpoint(...endpointParams));
      await dispatch({ type: receivedActionType, data });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function defaultPostHandler(endpoint, addActionType, ...endpointParams) {
  return async dispatch => {
    try {
      const resp = await dispatch(endpoint(...endpointParams));
      if(resp) await dispatch({ type: addActionType, data: resp });
      return Promise.resolve(resp);
    } catch(error) {
      return Promise.reject(error.message);
    }
  };
}

export function defaultDetailsHandler(endpoint, ...endpointParams) {
  return async dispatch => {
    try {
      const resp = await dispatch(endpoint(...endpointParams));
      return Promise.resolve(resp);
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function defaultPatchHandler(endpoint, ...endpointParams) {
  return async dispatch => {
    try {
      const resp = await dispatch(endpoint(...endpointParams));
      return Promise.resolve(resp);
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function defaultDeleteHandler(endpoint, deleteActionType, endpointParams) {
  return async dispatch => {
    if(!endpointParams.id) {
      return Promise.reject("No entity ID received");
    }
    try {
      await dispatch(endpoint(...Object.values(endpointParams)));
      await dispatch({ type: deleteActionType, id: endpointParams.id });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
