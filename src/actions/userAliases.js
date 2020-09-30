import {
  USER_ALIASES_DATA_RECEIVED,
  USER_ALIASES_DATA_FETCH,
  USER_ALIASES_DATA_ERROR,
} from './types';
import { userAliases, addUserAlias } from '../api';

export function fetchUserAliasesData(domainID) {
  return async dispatch => {
    await dispatch(userAliasDataFetch(true));
    try {
      const userAliasJSONData = await dispatch(userAliases(domainID));
      await dispatch(userAliasDataReceived(userAliasJSONData));
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(userAliasDataError(err));
    }
  };
}

export function addUserAliasData(domainID, userID, alias) {
  return async dispatch => {
    try {
      await dispatch(addUserAlias(domainID, userID, alias));
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(userAliasDataError(err));
    }
  };
}

export function deleteUserAliasData() {
  return async dispatch => {
    try {
      //await dispatch(deleteUserAlias(id));
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(userAliasDataError(err));
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
