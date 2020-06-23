import {
  USERS_DATA_FETCH,
  USERS_DATA_RECEIVED,
  USERS_DATA_ERROR,
  USER_DATA_ADD,
  USER_DATA_EDIT,
  USER_DATA_DELETE,
} from './types';
import { users, addUser, editUser, deleteUser } from '../api';

export function fetchUsersData() {
  return async dispatch => {
    await dispatch({type: USERS_DATA_FETCH});
    try {
      const data = await dispatch(users());
      await dispatch({type: USERS_DATA_RECEIVED, data});
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to fetch users'});
      console.error('Failed to fetch users');
    }
  };
}

export function addUserData(user) {
  return async dispatch => {
    try {
      let resp = await dispatch(addUser(user));
      if(resp) await dispatch({type: USER_DATA_ADD, user: resp});
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to add user'});
      console.error('Failed to add user', err);
    }
  };
}

export function editUserData(user) {
  return async dispatch => {
    try {
      const resp = await dispatch(editUser(user));
      await dispatch({type: USER_DATA_EDIT, user: resp});
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to edit user'});
      console.error('Failed to edit user', err);
    }
  };
}

export function deleteUserData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteUser(id));
      await dispatch({type: USER_DATA_DELETE, id});
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to delete user'});
      console.error('Failed to edit user', err);
    }
  };
}