// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import {
  LDAP_DATA_ERROR,
  LDAP_DATA_FETCH,
  LDAP_DATA_RECEIVED,
} from './types';
import { searchLdap, importUser, sync, syncAll, ldapConfig, updateLdap, deleteLdap, setAuthmgr, authmgr } from '../api';

export function fetchLdapConfig() {
  return async dispatch => {
    try {
      const resp = await dispatch(ldapConfig());
      return Promise.resolve(resp);
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}

export function updateLdapConfig(config, params) {
  return async dispatch => {
    try {
      const resp = await dispatch(updateLdap(config, params));
      return Promise.resolve(resp?.message);
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}

export function fetchAuthMgr() {
  return async dispatch => {
    try {
      const resp = await dispatch(authmgr());
      return Promise.resolve(resp);
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}

export function updateAuthMgr(config) {
  return async dispatch => {
    try {
      const resp = await dispatch(setAuthmgr(config));
      return Promise.resolve(resp?.message);
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

export function fetchLdapData(params) {
  return async dispatch => {
    await dispatch({ type: LDAP_DATA_FETCH });
    try {
      const resp = await dispatch(searchLdap(params));
      await dispatch({ type: LDAP_DATA_RECEIVED, data: resp });
    } catch (err) {
      await dispatch({ type: LDAP_DATA_ERROR, error: err });
      return Promise.reject(err.message);
    }
  };
}

export function importLdapData(params) {
  return async dispatch => {
    try {
      await dispatch(importUser(params));
      //await dispatch({ type: LDAP_DATA_RECEIVED, data: resp });
    } catch (err) {
      await dispatch({ type: LDAP_DATA_ERROR, error: err });
      return Promise.reject(err.message);
    }
  };
}

export function syncLdapData(domainID, userID) {
  return async dispatch => {
    try {
      const resp = await dispatch(sync(domainID, userID));
      return Promise.resolve(resp);
      //await dispatch({ type: LDAP_DATA_RECEIVED, data: resp });
    } catch (err) {
      await dispatch({ type: LDAP_DATA_ERROR, error: err });
      return Promise.reject(err.message);
    }
  };
}

export function syncLdapUsers(params, domainID) {
  return async dispatch => {
    try {
      await dispatch(syncAll(params, domainID));
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}
