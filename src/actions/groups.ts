// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  GROUPS_DATA_RECEIVED,
  GROUP_DATA_ADD,
  GROUP_DATA_DELETE,
  URLParams,
} from './types';
import { groups, addGroup, editGroup, deleteGroup, groupDetails, user } from '../api';
import { defaultDeleteHandler, defaultListHandler2, defaultPatchHandler,
  defaultPostHandler } from './handlers';
import { NewGroup, UpdateGroup } from '@/types/groups';


export function fetchGroupsData(domainID: number, params: URLParams) {
  return defaultListHandler2(groups, GROUPS_DATA_RECEIVED, domainID, params);
}

export function fetchGroupData(domainID: number, id: number) {
  return async () => {
    try {
      const group = await groupDetails(domainID, id);
      const groupUser = await user(domainID, group.user);
      group.user = groupUser;
      return Promise.resolve(group);
    } catch(error) {
      return Promise.reject(error.message);
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
