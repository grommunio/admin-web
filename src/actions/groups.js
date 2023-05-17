// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  GROUPS_DATA_RECEIVED,
  GROUP_DATA_ADD,
  GROUP_DATA_DELETE,
} from './types';
import { groups, addGroup, editGroup, deleteGroup, groupDetails } from '../api';
import { defaultDeleteHandler, defaultDetailsHandler, defaultPatchHandler,
  defaultPostHandler } from './handlers';

export function fetchGroupsData(domainID, params) {
  return async dispatch => {
    try {
      const response = await dispatch(groups(domainID, params));
      await dispatch({ type: GROUPS_DATA_RECEIVED, data: response, offset: params?.offset });
    } catch(error) {
      return Promise.reject(error.message);
    }
  };
}

export function fetchGroupData(...endpointParams) {
  return defaultDetailsHandler(groupDetails, ...endpointParams);
}

export function addGroupData(...endpointParams) {
  return defaultPostHandler(addGroup, GROUP_DATA_ADD, ...endpointParams);
}

export function editGroupData(...endpointParams) {
  return defaultPatchHandler(editGroup, ...endpointParams);
}

export function deleteGroupData(domainID, id) {
  return defaultDeleteHandler(deleteGroup, GROUP_DATA_DELETE, {domainID, id});
}
