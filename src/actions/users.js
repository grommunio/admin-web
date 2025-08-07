// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  USERS_DATA_RECEIVED,
  USER_DATA_ADD,
  USER_DATA_DELETE,
  USERS_NEXT_SET,
  ORPHANED_USERS_RECEIVED,
  ORPHANS_DELETED,
  USERS_SYNC_RECEIVED,
  USERS_FILTER_STATE,
} from './types';
import { user, allUsers, users, addUser, editUser, editUserRole, deleteUser, defaultDomainSyncPolicy,
  ldapDump, checkLdap, deleteOrphans, userSync, removeUserSync, userList,
  userDelegates, editUserDelegates, setPermittedUser, permittedUsers, usersPlain,
  userCount, 
  storeLangs,
  userSendAs,
  editUserSendAs,
  userOof,
  putUserOof,
  contacts,
  allContacts
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
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchContactsData(domainID, params) {
  return async dispatch => {
    try {
      const data = await dispatch(contacts(domainID, params));
      if(!params?.offset) await dispatch({ type: USERS_DATA_RECEIVED, data });
      else await dispatch({ type: USERS_NEXT_SET, data });
      return data;
    } catch(err) {
      console.error('Failed to fetch contacts');
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
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
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
    try {
      const data = await dispatch(allUsers(params));
      if(!params?.offset) await dispatch({ type: USERS_DATA_RECEIVED, data });
      else await dispatch({ type: USERS_NEXT_SET, data });
    } catch(err) {
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchAllContacts(params) {
  return async dispatch => {
    try {
      const data = await dispatch(allContacts(params));
      if(!params?.offset) await dispatch({ type: USERS_DATA_RECEIVED, data });
      else await dispatch({ type: USERS_NEXT_SET, data });
    } catch(err) {
      console.error('Failed to fetch contacts');
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

export function fetchUsersList(...endpointParams) {
  return defaultDetailsHandler(userList, ...endpointParams);
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

export function editUserRoles(...endpointParams) {
  return defaultPatchHandler(editUserRole, ...endpointParams);
}

export function deleteUserData(domainID, id, params) {
  return defaultDeleteHandler(deleteUser, USER_DATA_DELETE, { domainID, id, params });
}

export function deleteOrphanedUsers(params) {
  return async dispatch => {
    try {
      const res = await dispatch(deleteOrphans(params));
      await dispatch({ type: ORPHANS_DELETED, deletedIDs: res.deleted });
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


export function setFilterState(prop, value) {
  return {
    type: USERS_FILTER_STATE,
    prop,
    value
  };
}
