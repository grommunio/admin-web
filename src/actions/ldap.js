// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  LDAP_DATA_FETCH,
  LDAP_DATA_RECEIVED,
} from './types';
import { searchLdap, importUser, sync, syncAll, ldapConfig, updateLdap, deleteLdap, setAuthmgr, authmgr } from '../api';
import { defaultDetailsHandler, defaultListHandler, defaultPatchHandler } from './handlers';

export function fetchLdapConfig() {
  return defaultDetailsHandler(ldapConfig);
}

export function updateLdapConfig(config, params) {
  return async dispatch => {
    try {
      const resp = await dispatch(updateLdap(config, params));
      return Promise.resolve(resp?.message); // Can't use default hander here
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
      return Promise.resolve(resp?.message); // Can't use default hander here
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
  return defaultListHandler(searchLdap, LDAP_DATA_RECEIVED, LDAP_DATA_FETCH, ...endpointParams);
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
      if(resp?.taskID) return resp;
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}
