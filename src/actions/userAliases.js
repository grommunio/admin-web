import {
  USER_ALIASES_DATA_RECEIVED,
  USER_ALIASES_DATA_FETCH,
  USER_ALIASES_DATA_ERROR,
  USER_ALIAS_DATA_ADD,
  USER_ALIAS_DATA_DELETE,
} from './types';
import { userAliases, addUserAlias, deleteUserAlias } from '../api';

export function fetchUserAliasesData(domainID) {
  return async dispatch => {
    await dispatch(userAliasDataFetch(true));
    try {
      const userAliasJSONData = await dispatch(userAliases(domainID));
      await dispatch(userAliasDataReceived(userAliasJSONData));
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(userAliasDataError(err));
      return Promise.reject(err.message);
    }
  };
}

export function addUserAliasData(domainID, userID, alias) {
  return async dispatch => {
    try {
      const resp = await dispatch(addUserAlias(domainID, userID, alias));
      await dispatch({ type: USER_ALIAS_DATA_ADD, data: resp });
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(userAliasDataError(err));
      return Promise.reject(err.message);
    }
  };
}

export function deleteUserAliasData(domainID, aliasID, mainName) {
  return async dispatch => {
    try {
      await dispatch(deleteUserAlias(domainID, aliasID));
      await dispatch({ type: USER_ALIAS_DATA_DELETE, aliasID, mainName });
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(userAliasDataError(err));
      return Promise.reject(err.message);
    }
  };
}

export function editUserAliasData() {
  return async dispatch => {
    try {
      //await dispatch(editUserAlias(domainID, userID, newValue));
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(userAliasDataError(err));
    }
  };
}

function userAliasDataFetch(status=true) {
  return {
    type: USER_ALIASES_DATA_FETCH,
    status,
  };
}

function userAliasDataReceived(data) {
  return {
    type: USER_ALIASES_DATA_RECEIVED,
    data,
  };
}

function userAliasDataError(err) {
  return {
    type: USER_ALIASES_DATA_ERROR,
    err,
  };
}
