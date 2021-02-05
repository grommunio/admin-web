// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  GROUPS_DATA_RECEIVED,
  GROUPS_DATA_FETCH,
  GROUPS_DATA_ERROR,
  GROUP_DATA_DELETE,
  GROUP_DATA_ADD,
} from './types';
import { groups, addGroup, deleteGroup, editGroup, groupDetails } from '../api';

export function fetchGroupsData(domainID, params) {
  return async dispatch => {
    await dispatch(groupsDataFetch(true));
    try {
      const groupsJSONData = await dispatch(groups(domainID, params));
      await dispatch(groupsDataReceived(groupsJSONData));
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
      return Promise.reject(err.message);
    }
  };
}

export function fetchGroupDetails(domainID, id) {
  return async dispatch => {
    await dispatch(groupsDataFetch(true));
    try {
      const group = await dispatch(groupDetails(domainID, id));
      return Promise.resolve(group);
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
      return Promise.reject(err.message);
    }
  };
}

export function addGroupData(domainID, group) {
  return async dispatch => {
    try {
      const resp = await dispatch(addGroup(domainID, group));
      await dispatch({ type: GROUP_DATA_ADD, data: resp });
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
      return Promise.reject(err.message);
    }
  };
}

export function deleteGroupData(domainID, id) {
  return async dispatch => {
    try {
      await dispatch(deleteGroup(domainID, id));
      await dispatch(groupDataDelete(domainID, id));
    } catch(err) {
      console.error('failed to delete group data', err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
      return Promise.reject(err.message);
    }
  };
}

export function editGroupData(domainID, group) {
  return async dispatch => {
    try {
      await dispatch(editGroup(domainID, group));
    } catch(err) {
      console.error('failed to edit group data', err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
      return Promise.reject(err.message);
    }
  };
}

function groupsDataFetch(status=true) {
  return {
    type: GROUPS_DATA_FETCH,
    status,
  };
}

function groupsDataReceived(data) {
  return {
    type: GROUPS_DATA_RECEIVED,
    data,
  };
}

function groupsDataError(err) {
  return {
    type: GROUPS_DATA_ERROR,
    err,
  };
}

function groupDataDelete(id) {
  return {
    type: GROUP_DATA_DELETE,
    data: id,
  };
}
