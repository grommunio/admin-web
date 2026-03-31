// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  ROLES_DATA_RECEIVED,
  ROLE_DATA_ADD,
  ROLE_DATA_DELETE,
  PERMISSIONS_DATA_RECEIVED,
  ROLES_NEXT_SET,
  URLParams,
} from './types';
import { roles, editRole, permissions, addRole, deleteRole, role } from '../api';
import { defaultDeleteHandler, defaultDetailsHandler, defaultListHandler, defaultPatchHandler,
  defaultPostHandler } from './handlers';
import { Dispatch } from 'redux';
import { NewRole, UpdateRole } from '@/types/roles';
import { ApiError } from '@/types/common';


export function fetchRolesData(params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const response = await roles(params);
      if(!params?.offset) dispatch({ type: ROLES_DATA_RECEIVED, data: response });
      else dispatch({ type: ROLES_NEXT_SET, data: response });
    } catch(error) {
      console.error(error);
      const message = (error as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function fetchRoleData(roleID: number) {
  return defaultDetailsHandler(role, roleID);
}

export function fetchPermissionsData() {
  return defaultListHandler(permissions, PERMISSIONS_DATA_RECEIVED);
}

export function addRolesData(role: NewRole) {
  return defaultPostHandler(addRole, ROLE_DATA_ADD, role);
}

export function editRoleData(role: UpdateRole) {
  return defaultPatchHandler(editRole, role);
}

export function deleteRolesData(id: number) {
  return defaultDeleteHandler(deleteRole, ROLE_DATA_DELETE, {id});
}
