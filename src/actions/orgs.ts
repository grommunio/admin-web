// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  ORGS_DATA_RECEIVED,
  ORG_DATA_ADD,
  ORG_DATA_DELETE,
  URLParams,
} from './types';
import { orgs, orgDetails, addOrg, editOrg, deleteOrg } from '../api';
import { defaultDeleteHandler, defaultDetailsHandler,
  defaultPatchHandler, defaultPostHandler } from './handlers';
import { Dispatch } from 'redux';
import { NewOrg, UpdateOrg } from '@/types/orgs';
import { ApiError } from '@/types/common';

export function fetchOrgsData(params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const orgData = await orgs(params);
      dispatch({ type: ORGS_DATA_RECEIVED, data: orgData, offset: params?.offset });
      return Promise.resolve(orgData.data);
    } catch(error) {
      console.error(error);
      const message = (error as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function fetchOrgsDetails(orgID: number) {
  return defaultDetailsHandler(orgDetails, orgID);
}

export function addOrgData(org: NewOrg) {
  return defaultPostHandler(addOrg,ORG_DATA_ADD, org);
}

export function editOrgData(org: UpdateOrg) {
  return defaultPatchHandler(editOrg, org);
}

export function deleteOrgData(id: number) {
  return defaultDeleteHandler(deleteOrg, ORG_DATA_DELETE, {id});
}
