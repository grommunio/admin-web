import {
  ORGS_DATA_ERROR,
  ORGS_DATA_FETCH,
  ORGS_DATA_RECEIVED,
} from '../actions/types';
import { orgs, addOrg, editOrg, deleteOrg } from '../api';

export function fetchOrgsData() {
  return async dispatch => {
    await dispatch({ type: ORGS_DATA_FETCH });
    try {
      const orgData = await dispatch(orgs());
      await dispatch({ type: ORGS_DATA_RECEIVED, data: orgData });
    } catch(error) {
      await dispatch({ type: ORGS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function addOrgData(org) {
  return async dispatch => {
    try {
      await dispatch(addOrg(org));
    } catch(error) {
      await dispatch({ type: ORGS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function editOrgData(org) {
  return async dispatch => {
    try {
      await dispatch(editOrg(org));
    } catch(error) {
      await dispatch({ type: ORGS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function deleteOrgData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteOrg(id));
    } catch(error) {
      await dispatch({ type: ORGS_DATA_ERROR, error});
      console.error(error);
    }
  };
}