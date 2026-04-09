// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  GROUPS_DATA_RECEIVED,
  GROUP_DATA_ADD,
  GROUP_DATA_DELETE,
  URLParams,
} from './types';
import { groups, addGroup, editGroup, deleteGroup, groupDetails, user } from '../api';
import { defaultDeleteHandler, defaultPatchHandler,
  defaultPostHandler } from './handlers';
import { NewGroup, UpdateGroup } from '@/types/groups';
import { ApiError } from '@/types/common';
import { Dispatch } from 'redux';


export function fetchGroupsData(domainID: number, params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const serversData = await groups(domainID, params);
      dispatch({ type: GROUPS_DATA_RECEIVED, data: serversData, offset: params?.offset });
    } catch(error) {
      console.error(error);
      const message = (error as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function fetchGroupData(domainID: number, id: number) {
  return async () => {
    try {
      const group = await groupDetails(domainID, id);
      const groupUser = await user(domainID, group.user);
      group.user = groupUser;
      return Promise.resolve(group);
    } catch(error) {
      const message = (error as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function addGroupData(domainID: number, group: NewGroup) {
  return defaultPostHandler(addGroup, GROUP_DATA_ADD, domainID, group);
}

export function editGroupData(domainID: number, group: UpdateGroup) {
  return defaultPatchHandler(editGroup, domainID, group);
}

export function deleteGroupData(domainID: number, id: number) {
  return defaultDeleteHandler(deleteGroup, GROUP_DATA_DELETE, { domainID, id });
}
