// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  MLISTS_DATA_RECEIVED,
  MLIST_DATA_ADD,
  MLIST_DATA_DELETE,
} from '../actions/types';
import { mlists, addMlist, editMlist, deleteMlist, mlistDetails } from '../api';
import { defaultDeleteHandler, defaultDetailsHandler, defaultPatchHandler,
  defaultPostHandler } from './handlers';

export function fetchMListsData(domainID, params) {
  return async dispatch => {
    try {
      const response = await dispatch(mlists(domainID, params));
      await dispatch({ type: MLISTS_DATA_RECEIVED, data: response, offset: params?.offset });
    } catch(error) {
      return Promise.reject(error.message);
    }
  };
}

export function fetchMListData(...endpointParams) {
  return defaultDetailsHandler(mlistDetails, ...endpointParams);
}

export function addMListData(...endpointParams) {
  return defaultPostHandler(addMlist, MLIST_DATA_ADD, ...endpointParams);
}

export function editMListData(...endpointParams) {
  return defaultPatchHandler(editMlist, ...endpointParams);
}

export function deleteMListData(domainID, id) {
  return defaultDeleteHandler(deleteMlist, MLIST_DATA_DELETE, {domainID, id});
}
