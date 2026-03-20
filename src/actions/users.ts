// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  USERS_DATA_RECEIVED,
  USER_DATA_ADD,
  USER_DATA_DELETE,
  USERS_NEXT_SET,
  ORPHANED_USERS_RECEIVED,
  ORPHANS_DELETED,
  USERS_SYNC_RECEIVED,
  USERS_FILTER_STATE,
  URLParams,
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
import { Dispatch } from 'redux';
import { CheckLdapUsersParams, LdapDumpParams } from '@/types/ldap';
import { DeleteOrphanedUsersParams, DeleteUserParams, NewUser, OofSettings, UpdateUser } from '@/types/users';


export function fetchUsersData(domainID: number, params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const data = await users(domainID, params);
      if(!params?.offset) dispatch({ type: USERS_DATA_RECEIVED, data });
      else dispatch({ type: USERS_NEXT_SET, data });
      return data;
    } catch(err) {
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchContactsData(domainID: number, params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const data = await contacts(domainID, params);
      if(!params?.offset) dispatch({ type: USERS_DATA_RECEIVED, data });
      else dispatch({ type: USERS_NEXT_SET, data });
      return data;
    } catch(err) {
      console.error('Failed to fetch contacts');
      return Promise.reject(err.message);
    }
  };
}

export function fetchPlainUsersData(domainID: number, params:URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const data = await usersPlain(domainID, params);
      dispatch({ type: USERS_DATA_RECEIVED, data });
      return data;
    } catch(err) {
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchUserCount(domainID: number) {
  return async () => {
    try {
      const data = await userCount(domainID);
      return data.count;
    } catch(err) {
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchUserData(domainID: number, userID: number) {
  return async () => {
    let userData = {};
    try {
      userData = await user(domainID, userID);
    } catch(err) {
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
    try {
      const defaultPolicy = await defaultDomainSyncPolicy(domainID);
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

export function fetchAllUsers(params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const data = await allUsers(params);
      if(!params?.offset) dispatch({ type: USERS_DATA_RECEIVED, data });
      else dispatch({ type: USERS_NEXT_SET, data });
    } catch(err) {
      console.error('Failed to fetch users');
      return Promise.reject(err.message);
    }
  };
}

export function fetchAllContacts(params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const data = await allContacts(params);
      if(!params?.offset) dispatch({ type: USERS_DATA_RECEIVED, data });
      else dispatch({ type: USERS_NEXT_SET, data });
    } catch(err) {
      console.error('Failed to fetch contacts');
      return Promise.reject(err.message);
    }
  };
}

export function fetchLdapDump(params: LdapDumpParams) {
  return defaultDetailsHandler(ldapDump, params);
}

export function fetchUserSync(domainID: number, userID: number) {
  return defaultListHandler(userSync, USERS_SYNC_RECEIVED, domainID, userID);
}

export function fetchUserOof(domainID: number, userID: number) {
  return defaultDetailsHandler(userOof, domainID, userID);
}

export function deleteUserSync(domainID: number, userID: number) {
  return defaultPatchHandler(removeUserSync, domainID, userID);
}

export function fetchUserDelegates(domainID: number, userID: number) {
  return defaultDetailsHandler(userDelegates, domainID, userID);
}

export function fetchUsersList() {
  return defaultDetailsHandler(userList);
}

export function fetchUserSendAs(domainID: number, userID: number) {
  return defaultDetailsHandler(userSendAs, domainID, userID);
}

export function fetchPermittedUsers(domainID: number, userID: number) {
  return defaultDetailsHandler(permittedUsers, domainID, userID);
}

export function setUserDelegates(domainID: number, userID: number, delegates: string[]) {
  return defaultPatchHandler(editUserDelegates, domainID, userID, delegates);
}

export function setUserOof(domainID: number, userID: number, oofSettings: OofSettings) {
  return defaultPatchHandler(putUserOof, domainID, userID, oofSettings);
}

export function setUserSendAs(domainID: number, userID: number, sendAss: string[]) {
  return defaultPatchHandler(editUserSendAs, domainID, userID, sendAss);
}

export function checkLdapUsers(params: CheckLdapUsersParams) {
  return defaultListHandler(checkLdap, ORPHANED_USERS_RECEIVED, params);
}

export function addUserData(domainID: number, user: NewUser) {
  return defaultPostHandler(addUser, USER_DATA_ADD, domainID, user);
}

export function setPermittedUserData(domainID: number, folderID: number, permittedUsers: string[]) {
  return defaultPatchHandler(setPermittedUser, domainID, folderID, permittedUsers);
}

export function editUserData(domainID: number, user: UpdateUser) {
  return defaultPatchHandler(editUser, domainID, user);
}

export function editUserRoles(domainID: number, userID: number, roles: { roles: number[] }) {
  return defaultPatchHandler(editUserRole, domainID, userID, roles);
}

export function deleteUserData(domainID: number, id: number, params?: DeleteUserParams) {
  return defaultDeleteHandler(deleteUser, USER_DATA_DELETE, { domainID, id, params });
}

export function deleteOrphanedUsers(params: DeleteOrphanedUsersParams) {
  return async (dispatch: Dispatch) => {
    try {
      const res = await deleteOrphans(params);
      dispatch({ type: ORPHANS_DELETED, deletedIDs: res.deleted });
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}

export function getStoreLangs() {
  return async () => {
    try {
      const langs = await storeLangs();
      return Promise.resolve(langs.data);
    } catch(err) {
      return Promise.reject(err.message);
    }
  };
}


export function setFilterState(prop: string, value: string | number | boolean) {
  return {
    type: USERS_FILTER_STATE,
    prop,
    value
  };
}
