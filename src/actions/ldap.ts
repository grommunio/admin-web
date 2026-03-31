// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  LDAP_DATA_RECEIVED,
  LDAP_DATA_CLEAR,
  URLParams,
} from './types';
import { searchLdap, importUser, sync, syncAll, ldapConfig, updateLdap, deleteLdap, setAuthmgr,
  authmgr, orgLdapConfig, orgSyncAll, updateOrgLdap, deleteOrgLdap } from '../api';
import { defaultDetailsHandler, defaultListHandler, defaultPatchHandler } from './handlers';
import { FetchLdapParams, ImportLdapParams, LdapConfigData, SyncLdapParams } from '@/types/ldap';
import { ApiError } from '@/types/common';


export function fetchLdapConfig() {
  return defaultDetailsHandler(ldapConfig);
}

export function updateLdapConfig(config: LdapConfigData, params: {force?: boolean & URLParams }) {
  return async () => {
    try {
      const resp = await updateLdap(config, params);
      return Promise.resolve(resp?.message); // Can't use default handler here
    } catch (err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function fetchAuthMgr() {
  return defaultDetailsHandler(authmgr);
}

export function updateAuthMgr(config: { authBackendSelection: string }) {
  return async () => {
    try {
      const resp = await setAuthmgr(config);
      return Promise.resolve(resp?.message); // Can't use default handler here
    } catch (err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function deleteLdapConfig() {
  return async () => {
    try {
      await deleteLdap();
    } catch (err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function fetchLdapData(params: FetchLdapParams) {
  return defaultListHandler(searchLdap, LDAP_DATA_RECEIVED, params);
}

export function importLdapData(params: ImportLdapParams) {
  // Somewhat misleading, but the imported data isn't used in the list
  return defaultPatchHandler(importUser, params);
}

export function syncLdapData(domainID: number, userID: number) {
  return defaultDetailsHandler(sync, domainID, userID);
}

export function syncLdapUsers(params: SyncLdapParams, domainID?: number) {
  return async () => {
    try {
      const resp = await syncAll(params, domainID);
      return resp;
    } catch (err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function clearLdapSearch() {
  return {
    type: LDAP_DATA_CLEAR,
  };
}

/* ORGANIZATION LDAP */

export function fetchOrgLdapConfig(orgID: number) {
  return defaultDetailsHandler(orgLdapConfig, orgID);
}

export function syncOrgLdapUsers(orgID: number, params: SyncLdapParams) {
  return async () => {
    try {
      const resp = await orgSyncAll(orgID, params);
      return resp;
    } catch (err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function updateOrgLdapConfig(orgID: number, config: LdapConfigData, params: { force: boolean }) {
  return async () => {
    try {
      const resp = await updateOrgLdap(orgID, config, params);
      return Promise.resolve(resp?.message); // Can't use default handler here
    } catch (err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function deleteOrgLdapConfig(orgID: number) {
  return async () => {
    try {
      await deleteOrgLdap(orgID);
    } catch (err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}
