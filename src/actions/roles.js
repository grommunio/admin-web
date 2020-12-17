// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  ROLES_DATA_ERROR,
  ROLES_DATA_FETCH,
  ROLES_DATA_RECEIVED,
  ROLE_DATA_ADD,
  ROLE_DATA_DELETE,
  PERMISSIONS_DATA_RECEIVED,
  ROLES_NEXT_SET,
} from '../actions/types';
import { roles, editRole, permissions, addRole, deleteRole, role } from '../api';

export function fetchRolesData(params) {
  return async dispatch => {
    await dispatch({ type: ROLES_DATA_FETCH });
    try {
      const response = await dispatch(roles(params));
      if(!params.offset) await dispatch({ type: ROLES_DATA_RECEIVED, data: response });
      else await dispatch({ type: ROLES_NEXT_SET, data: response });
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchRoleData(id) {
  return async dispatch => {
    try {
      const roleData = await dispatch(role(id));
      return Promise.resolve(roleData);
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchPermissionsData(params) {
  return async dispatch => {
    try {
      const response = await dispatch(permissions(params));
      await dispatch({ type: PERMISSIONS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function addRolesData(role) {
  return async dispatch => {
    try {
      const resp = await dispatch(addRole(role));
      await dispatch({ type: ROLE_DATA_ADD, data: resp });
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function editRoleData(role) {
  return async dispatch => {
    try {
      await dispatch(editRole(role));
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteRolesData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteRole(id));
      await dispatch({ type: ROLE_DATA_DELETE, ID: id });
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
