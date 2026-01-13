// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  ORGS_DATA_RECEIVED,
  ORG_DATA_ADD,
  ORG_DATA_DELETE,
} from '../actions/types';
import { orgs, orgDetails, addOrg, editOrg, deleteOrg } from '../api';
import { defaultDeleteHandler, defaultDetailsHandler,
  defaultPatchHandler, defaultPostHandler } from './handlers';

export function fetchOrgsData(params={}) {
  return async dispatch => {
    try {
      const orgData = await dispatch(orgs(params));
      await dispatch({ type: ORGS_DATA_RECEIVED, data: orgData, offset: params?.offset });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchOrgsDetails(...endpointParams) {
  return defaultDetailsHandler(orgDetails, ...endpointParams);
}

export function addOrgData(...endpointParams) {
  return defaultPostHandler(addOrg,ORG_DATA_ADD, ...endpointParams);
}

export function editOrgData(...endpointParams) {
  return defaultPatchHandler(editOrg, ...endpointParams);
}

export function deleteOrgData(id) {
  return defaultDeleteHandler(deleteOrg, ORG_DATA_DELETE, {id});
}
