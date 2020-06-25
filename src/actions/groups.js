import {
  GROUPS_DATA_RECEIVED,
  GROUPS_DATA_FETCH,
  GROUPS_DATA_ERROR,
  GROUP_DATA_DELETE,
} from './types';
import { groups, addGroup, deleteGroup, editGroup } from '../api';

export function fetchGroupsData() {
  return async dispatch => {
    await dispatch(groupsDataFetch(true));
    try {
      const groupsJSONData = await dispatch(groups());
      await dispatch(groupsDataReceived(groupsJSONData));
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
    }
  };
}

export function addGroupData(data) {
  return async dispatch => {
    try {
      await dispatch(addGroup(data));
    } catch(err) {
      console.error('failed to fetch groups data', err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
    }
  };
}

export function deleteGroupData(id) {
  return async dispatch => {
    try {
      await dispatch(groupDataDelete(id));
      await dispatch(deleteGroup(id));
    } catch(err) {
      console.error('failed to delete group data', err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
    }
  };
}

export function editGroupData(id, newValue) {
  return async dispatch => {
    try {
      await dispatch(editGroup(id, newValue));
    } catch(err) {
      console.error('failed to edit group data', err); // eslint-disable-line no-console
      await dispatch(groupsDataError(err));
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
