// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  LDAP_DATA_RECEIVED,
  LDAP_DATA_CLEAR,
} from './types';
import { searchLdap, importUser, sync, syncAll, ldapConfig, updateLdap, deleteLdap, setAuthmgr,
  authmgr, orgLdapConfig, orgSyncAll, updateOrgLdap, deleteOrgLdap } from '../api';
import { defaultDetailsHandler, defaultListHandler, defaultPatchHandler } from './handlers';

export function fetchLdapConfig() {
  return defaultDetailsHandler(ldapConfig);
}

export function updateLdapConfig(config, params) {
  return async dispatch => {
    try {
      const resp = await dispatch(updateLdap(config, params));
      return Promise.resolve(resp?.message); // Can't use default handler here
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}

export function fetchAuthMgr() {
  return defaultDetailsHandler(authmgr);
}

export function updateAuthMgr(config) {
  return async dispatch => {
    try {
      const resp = await dispatch(setAuthmgr(config));
      return Promise.resolve(resp?.message); // Can't use default handler here
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}

export function deleteLdapConfig() {
  return async dispatch => {
    try {
      await dispatch(deleteLdap());
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}

export function fetchLdapData(...endpointParams) {
  return defaultListHandler(searchLdap, LDAP_DATA_RECEIVED, ...endpointParams);
}

export function importLdapData(...endpointParams) {
  // Somewhat misleading, but the imported data isn't used in the list
  return defaultPatchHandler(importUser, ...endpointParams);
}

export function syncLdapData(...endpointParams) {
  return defaultDetailsHandler(sync, ...endpointParams);
}

export function syncLdapUsers(params, domainID) {
  return async dispatch => {
    try {
      const resp = await dispatch(syncAll(params, domainID));
      return resp;
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}

export function clearLdapSearch() {
  return {
    type: LDAP_DATA_CLEAR,
  };
}

/* ORGANIZATION LDAP */

export function fetchOrgLdapConfig(...endpointParams) {
  return defaultDetailsHandler(orgLdapConfig, ...endpointParams);
}

export function syncOrgLdapUsers(orgID, params) {
  return async dispatch => {
    try {
      const resp = await dispatch(orgSyncAll(orgID, params));
      return resp;
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}

export function updateOrgLdapConfig(orgID, config, params) {
  return async dispatch => {
    try {
      const resp = await dispatch(updateOrgLdap(orgID, config, params));
      return Promise.resolve(resp?.message); // Can't use default handler here
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}

export function deleteOrgLdapConfig(orgID) {
  return async dispatch => {
    try {
      await dispatch(deleteOrgLdap(orgID));
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}
