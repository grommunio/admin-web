import {
  LDAP_DATA_ERROR,
  LDAP_DATA_FETCH,
  LDAP_DATA_RECEIVED,
} from './types';
import { searchLdap, importUser, sync, syncAll, ldapConfig, updateLdap } from '../api';

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

export function updateLdapConfig(config) {
  return async dispatch => {
    try {
      const resp = await dispatch(updateLdap(config));
      return Promise.resolve(resp);
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

export function syncLdapUsers() {
  return async dispatch => {
    try {
      await dispatch(syncAll());
    } catch (err) {
      return Promise.reject(err.message);
    }
  };
}
