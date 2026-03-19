// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  ROLES_DATA_RECEIVED,
  ROLE_DATA_ADD,
  ROLE_DATA_DELETE,
  PERMISSIONS_DATA_RECEIVED,
  ROLES_NEXT_SET,
} from './types';
import { roles, editRole, permissions, addRole, deleteRole, role } from '../api';
import { defaultDeleteHandler, defaultDetailsHandler, defaultListHandler, defaultPatchHandler,
  defaultPostHandler } from './handlers';
import { Dispatch } from 'redux';


export function fetchRolesData(params) {
  return async (dispatch: Dispatch) => {
    try {
      const response = await roles(params);
      if(!params?.offset) dispatch({ type: ROLES_DATA_RECEIVED, data: response });
      else dispatch({ type: ROLES_NEXT_SET, data: response });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchRoleData(roleID: number) {
  return defaultDetailsHandler(role, roleID);
}

export function fetchPermissionsData() {
  return defaultListHandler(permissions, PERMISSIONS_DATA_RECEIVED);
}

export function addRolesData(...endpointParams) {
  return defaultPostHandler(addRole, ROLE_DATA_ADD, ...endpointParams);
}

export function editRoleData(...endpointParams) {
  return defaultPatchHandler(editRole, ...endpointParams);
}

export function deleteRolesData(id) {
  return defaultDeleteHandler(deleteRole, ROLE_DATA_DELETE, {id});
}
