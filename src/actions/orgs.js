// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  ORGS_DATA_FETCH,
  ORGS_DATA_RECEIVED,
  ORG_DATA_ADD,
  ORG_DATA_DELETE,
} from '../actions/types';
import { orgs, orgDetails, addOrg, editOrg, deleteOrg } from '../api';

export function fetchOrgsData(params) {
  return async dispatch => {
    await dispatch({ type: ORGS_DATA_FETCH });
    try {
      const orgData = await dispatch(orgs(params));
      await dispatch({ type: ORGS_DATA_RECEIVED, data: orgData });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchOrgsDetails(id) {
  return async dispatch => {
    try {
      const orgData = await dispatch(orgDetails(id));
      return Promise.resolve(orgData);
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function addOrgData(org) {
  return async dispatch => {
    try {
      const resp = await dispatch(addOrg(org));
      await dispatch({ type: ORG_DATA_ADD, data: resp });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function editOrgData(org) {
  return async dispatch => {
    try {
      await dispatch(editOrg(org));
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteOrgData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteOrg(id));
      await dispatch({ type: ORG_DATA_DELETE, id });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
