// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  USERS_DATA_RECEIVED,
  USERS_DATA_ERROR,
  USER_DATA_ADD,
  USER_DATA_DELETE,
  USERS_NEXT_SET,
  ORPHANED_USERS_RECEIVED,
  ORPHANS_DELETED,
  USERS_SYNC_RECEIVED
} from './types';
import { user, allUsers, users, addUser, editUser, editUserRole, deleteUser, defaultDomainSyncPolicy,
  ldapDump, checkLdap, deleteOrphans, storeProps, editStoreProps, deleteStoreProps, userSync, removeUserSync,
  userDelegates, editUserDelegates, setPermittedUser, permittedUsers, usersPlain,
  userCount, 
  storeLangs,
  userSendAs,
  editUserSendAs,
  userOof,
  putUserOof
} from '../api';
import { defaultDeleteHandler, defaultDetailsHandler, defaultListHandler, defaultPatchHandler,
  defaultPostHandler } from './handlers';

export function fetchUsersData(domainID, params) {
  return async dispatch => {
    try {
      const data = await dispatch(users(domainID, params));
      if(!params?.offset) await dispatch({ type: USERS_DATA_RECEIVED, data });
      else await dispatch({ type: USERS_NEXT_SET, data });
      return data;
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to fetch users'});
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchPlainUsersData(domainID, params) {
  return async dispatch => {
    try {
      const data = await dispatch(usersPlain(domainID, params));
      await dispatch({ type: USERS_DATA_RECEIVED, data });
      return data;
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to fetch users'});
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchUserCount(domainID) {
  return async dispatch => {
    try {
      const data = await dispatch(userCount(domainID));
      return data.count;
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to fetch users'});
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchUserData(domainID, userID, ignoreStoreData) {
  return async dispatch => {
    let userData = {};
    try {
      userData = await dispatch(user(domainID, userID));
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to fetch users'});
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
    if(!ignoreStoreData) {
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
    }
    return Promise.resolve(userData);
  };
}

export function fetchAllUsers(params) {
  return async dispatch => {
    try {
      const data = await dispatch(allUsers(params));
      if(!params?.offset) await dispatch({ type: USERS_DATA_RECEIVED, data });
      else await dispatch({ type: USERS_NEXT_SET, data });
    } catch(err) {
      await dispatch({type: USERS_DATA_ERROR, error: 'Failed to fetch users'});
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchLdapDump(...endpointParams) {
  return defaultDetailsHandler(ldapDump, ...endpointParams);
}

export function fetchUserSync(...endpointParams) {
  return defaultListHandler(userSync, USERS_SYNC_RECEIVED, ...endpointParams);
}

export function fetchUserOof(...endpointParams) {
  return defaultDetailsHandler(userOof, ...endpointParams);
}

export function deleteUserSync(...endpointParams) {
  return defaultPatchHandler(removeUserSync, ...endpointParams);
}

export function fetchUserDelegates(...endpointParams) {
  return defaultDetailsHandler(userDelegates, ...endpointParams);
}

export function fetchUserSendAs(...endpointParams) {
  return defaultDetailsHandler(userSendAs, ...endpointParams);
}

export function fetchPermittedUsers(...endpointParams) {
  return defaultDetailsHandler(permittedUsers, ...endpointParams);
}

export function setUserDelegates(...endpointParams) {
  return defaultPatchHandler(editUserDelegates, ...endpointParams);
}

export function setUserOof(...endpointParams) {
  return defaultPatchHandler(putUserOof, ...endpointParams);
}

export function setUserSendAs(...endpointParams) {
  return defaultPatchHandler(editUserSendAs, ...endpointParams);
}

export function checkLdapUsers(...endpointParams) {
  return defaultListHandler(checkLdap, ORPHANED_USERS_RECEIVED, ...endpointParams);
}

export function addUserData(...endpointParams) {
  return defaultPostHandler(addUser, USER_DATA_ADD, ...endpointParams);
}

export function setPermittedUserData(...endpointParams) {
  return defaultPatchHandler(setPermittedUser, ...endpointParams);
}

export function editUserData(...endpointParams) {
  return defaultPatchHandler(editUser, ...endpointParams);
}

export function editUserStore(...endpointParams) {
  return defaultPatchHandler(editStoreProps, ...endpointParams);
}

export function editUserRoles(...endpointParams) {
  return defaultPatchHandler(editUserRole, ...endpointParams);
}

export function deleteUserData(domainID, id, params) {
  return defaultDeleteHandler(deleteUser, USER_DATA_DELETE, { domainID, id, params });
}

export function deleteUserStore(...endpointParams) {
  return defaultPatchHandler(deleteStoreProps, ...endpointParams);
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

export function getStoreLangs() {
  return async dispatch => {
    try {
      const langs = await dispatch(storeLangs());
      return Promise.resolve(langs.data);
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}
