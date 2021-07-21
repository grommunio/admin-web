// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import {
  MLISTS_DATA_ERROR,
  MLISTS_DATA_FETCH,
  MLISTS_DATA_RECEIVED,
  MLIST_DATA_ADD,
  MLIST_DATA_DELETE,
} from '../actions/types';
import { mlists, addMlist, editMlist, deleteMlist, mlistDetails } from '../api';

export function fetchMListsData(domainID, params) {
  return async dispatch => {
    await dispatch({ type: MLISTS_DATA_FETCH });
    try {
      const response = await dispatch(mlists(domainID, params));
      await dispatch({ type: MLISTS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: MLISTS_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}

export function fetchMListData(domainID, id) {
  return async dispatch => {
    await dispatch({ type: MLISTS_DATA_FETCH });
    try {
      const response = await dispatch(mlistDetails(domainID, id));
      return Promise.resolve(response);
    } catch(error) {
      await dispatch({ type: MLISTS_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}

export function addMListData(domainID, mlist) {
  return async dispatch => {
    try {
      const resp = await dispatch(addMlist(domainID, mlist));
      await dispatch({ type: MLIST_DATA_ADD, data: resp });
    } catch(error) {
      await dispatch({ type: MLISTS_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}

export function editMListData(domainID, mlist) {
  return async dispatch => {
    try {
      await dispatch(editMlist(domainID, mlist));
    } catch(error) {
      await dispatch({ type: MLISTS_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}

export function deleteMListData(domainID, id) {
  return async dispatch => {
    try {
      await dispatch(deleteMlist(domainID, id));
      await dispatch({ type: MLIST_DATA_DELETE, id });
    } catch(error) {
      await dispatch({ type: MLISTS_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}
