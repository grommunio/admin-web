import {
  ROLES_DATA_ERROR,
  ROLES_DATA_FETCH,
  ROLES_DATA_RECEIVED,
  ROLE_DATA_ADD,
  PERMISSIONS_DATA_RECEIVED,
} from '../actions/types';
import { roles, permissions, addRole, deleteRole } from '../api';

export function fetchRolesData() {
  return async dispatch => {
    await dispatch({ type: ROLES_DATA_FETCH });
    try {
      const response = await dispatch(roles());
      await dispatch({ type: ROLES_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function fetchPermissionsData() {
  return async dispatch => {
    try {
      const response = await dispatch(permissions());
      await dispatch({ type: PERMISSIONS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function addRolesData(role) {
  return async dispatch => {
    try {
      const resp = await dispatch(addRole(role));
      await dispatch({ ROLE_DATA_ADD, data: resp });
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function editRolesData() {
  return async dispatch => {
    try {
      //await dispatch(editMlist(mlist));
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function deleteRolesData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteRole(id));
    } catch(error) {
      await dispatch({ type: ROLES_DATA_ERROR, error});
      console.error(error);
    }
  };
}