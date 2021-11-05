// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import {
  USERS_DATA_FETCH,
  USERS_DATA_RECEIVED,
  USERS_DATA_ERROR,
  USER_DATA_ADD,
  USER_DATA_EDIT,
  USER_DATA_DELETE,
  USERS_NEXT_SET,
  ORPHANED_USERS_RECEIVED,
  ORPHANS_DELETED,
  USERS_SYNC_RECEIVED,
} from './types';
import { user, allUsers, users, addUser, editUser, editUserRole, deleteUser, defaultDomainSyncPolicy,
  ldapDump, checkLdap, deleteOrphans, storeProps, editStoreProps, deleteStoreProps, userSync,
  userDelegates, editUserDelegates, addPermittedUser, permittedUsers, deletePermittedUser } from '../api';

export function fetchUsersData(domainID, params) {
  return async dispatch => {
    await dispatch({type: USERS_DATA_FETCH});
    try {
      const data = await dispatch(users(domainID, params));
      if(!params.offset) await dispatch({ type: USERS_DATA_RECEIVED, data });
      else await dispatch({ type: USERS_NEXT_SET, data });
      return data;
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to fetch users'});
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchUserData(domainID, userID) {
  return async dispatch => {
    let userData = {};
    try {
      userData = await dispatch(user(domainID, userID));
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to fetch users'});
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
    try {
      const additionalProps = await dispatch(storeProps(domainID, userID,
        'messagesizeextended,storagequotalimit,prohibitreceivequota,prohibitsendquota'));
      if(additionalProps?.data) userData = {
        ...userData,
        properties: {
          ...userData.properties,
          ...additionalProps.data,
        },
      };
    } catch(err) {
      // ignore error
    }
    try {
      const defaultPolicy = await dispatch(defaultDomainSyncPolicy(domainID));
      userData = {
        ...userData,
        defaultPolicy: defaultPolicy?.data || {},
      };
    } catch(err) {
      // ignore error
    }
    return Promise.resolve(userData);
  };
}

export function fetchAllUsers(params) {
  return async dispatch => {
    await dispatch({type: USERS_DATA_FETCH});
    try {
      const data = await dispatch(allUsers(params));
      await dispatch({type: USERS_DATA_RECEIVED, data});
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to fetch users'});
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchLdapDump(params) {
  return async dispatch => {
    try {
      const data = await dispatch(ldapDump(params));
      return Promise.resolve(data);
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}

export function fetchUserSync(domainID, userID) {
  return async dispatch => {
    try {
      const data = await dispatch(userSync(domainID, userID));
      await dispatch({type: USERS_SYNC_RECEIVED, data});
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}

export function fetchUserDelegates(domainID, userID) {
  return async dispatch => {
    try {
      const data = await dispatch(userDelegates(domainID, userID));
      return Promise.resolve(data);
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}

export function fetchPermittedUsers(domainID, userID, params) {
  return async dispatch => {
    try {
      const data = await dispatch(permittedUsers(domainID, userID, params));
      return Promise.resolve(data);
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}

export function setUserDelegates(domainID, userID, delegates) {
  return async dispatch => {
    try {
      await dispatch(editUserDelegates(domainID, userID, delegates));
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}

export function checkLdapUsers(params) {
  return async dispatch => {
    try {
      const data = await dispatch(checkLdap(params));
      await dispatch({ type: ORPHANED_USERS_RECEIVED, data });
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}

export function addUserData(domainID, user) {
  return async dispatch => {
    try {
      let resp = await dispatch(addUser(domainID, user));
      if(resp) await dispatch({type: USER_DATA_ADD, user: resp});
      return Promise.resolve(resp);
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to add user'});
      console.error('Failed to add user', err);
      return Promise.reject(err.message);
    }
  };
}

export function addPermittedUserData(domainID, user, permittedUser) {
  return async dispatch => {
    try {
      await dispatch(addPermittedUser(domainID, user, permittedUser));
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to add user'});
      console.error('Failed to add user', err);
      return Promise.reject(err.message);
    }
  };
}

export function editUserData(domainID, user) {
  return async dispatch => {
    try {
      const resp = await dispatch(editUser(domainID, user));
      await dispatch({type: USER_DATA_EDIT, user: resp});
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to edit user'});
      console.error('Failed to edit user', err);
      return Promise.reject(err.message);
    }
  };
}

export function editUserStore(domainID, userID, props) {
  return async dispatch => {
    try {
      await dispatch(editStoreProps(domainID, userID, props));
    } catch(err) {
      console.error('Failed to edit user', err);
      return Promise.reject(err.message);
    }
  };
}

export function editUserRoles(domainID, userID, roles) {
  return async dispatch => {
    try {
      await dispatch(editUserRole(domainID, userID, roles));
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to edit user'});
      console.error('Failed to edit user', err);
      return Promise.reject(err.message);
    }
  };
}

export function deleteUserData(domainID, id, deleteFiles) {
  return async dispatch => {
    try {
      await dispatch(deleteUser(domainID, id, deleteFiles));
      await dispatch({type: USER_DATA_DELETE, id});
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to delete user'});
      console.error('Failed to edit user', err);
      return Promise.reject(err.message);
    }
  };
}

export function deleteUserStore(domainID, userID, props) {
  return async dispatch => {
    try {
      await dispatch(deleteStoreProps(domainID, userID, props));
    } catch(err) {
      console.error('Failed to delete user storedata', err);
      return Promise.reject(err.message);
    }
  };
}

export function deletePermittedUserData(domainID, userID, id) {
  return async dispatch => {
    try {
      await dispatch(deletePermittedUser(domainID, userID, id));
    } catch(err) {
      console.error('Failed to delete user storedata', err);
      return Promise.reject(err.message);
    }
  };
}

export function deleteOrphanedUsers(params) {
  return async dispatch => {
    try {
      await dispatch(deleteOrphans(params));
      await dispatch({ type: ORPHANS_DELETED });
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}
