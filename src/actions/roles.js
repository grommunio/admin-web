// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  ROLES_DATA_RECEIVED,
  ROLE_DATA_ADD,
  ROLE_DATA_DELETE,
  PERMISSIONS_DATA_RECEIVED,
  ROLES_NEXT_SET,
} from '../actions/types';
import { roles, editRole, permissions, addRole, deleteRole, role } from '../api';
import { defaultDeleteHandler, defaultDetailsHandler, defaultListHandler, defaultPatchHandler,
  defaultPostHandler } from './handlers';

export function fetchRolesData(params) {
  return async dispatch => {
    try {
      const response = await dispatch(roles(params));
      if(!params?.offset) await dispatch({ type: ROLES_DATA_RECEIVED, data: response });
      else await dispatch({ type: ROLES_NEXT_SET, data: response });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchRoleData(...endpointParams) {
  return defaultDetailsHandler(role, ...endpointParams);
}

export function fetchPermissionsData(...endpointParams) {
  return defaultListHandler(permissions, PERMISSIONS_DATA_RECEIVED, ...endpointParams);
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
