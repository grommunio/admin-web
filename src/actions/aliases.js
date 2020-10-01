import {
  ALIASES_DATA_RECEIVED,
  ALIASES_DATA_FETCH,
  ALIASES_DATA_ERROR,
  ALIAS_DATA_ADD,
} from './types';
import { aliases, addAlias, deleteAlias, editAlias } from '../api';

export function fetchAliasesData() {
  return async dispatch => {
    await dispatch(groupsDataFetch(true));
    try {
      const groupsJSONData = await dispatch(aliases());
      await dispatch(groupsDataReceived(groupsJSONData));
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
      return Promise.reject(err.message);
    }
  };
}

export function addAliasData(domainID, alias) {
  return async dispatch => {
    try {
      const resp = await dispatch(addAlias(domainID, alias));
      await dispatch({ type: ALIAS_DATA_ADD, data: resp });
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
      return Promise.reject(err.message);
    }
  };
}

export function deleteAliasData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteAlias(id));
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
      return Promise.reject(err.message);
    }
  };
}

export function editAliasData(id, newValue) {
  return async dispatch => {
    try {
      await dispatch(editAlias(id, newValue));
    } catch(err) {
      console.error(err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
    }
  };
}

function groupsDataFetch(status=true) {
  return {
    type: ALIASES_DATA_FETCH,
    status,
  };
}

function groupsDataReceived(data) {
  return {
    type: ALIASES_DATA_RECEIVED,
    data,
  };
}

function groupsDataError(err) {
  return {
    type: ALIASES_DATA_ERROR,
    err,
  };
}
