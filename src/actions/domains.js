// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  DOMAIN_DATA_RECEIVED,
  DOMAIN_DATA_ADD,
  DOMAIN_NEXT_SET,
  DOMAIN_DATA_DELETE,
} from '../actions/types';
import { domains, addDomain, editDomain, deleteDomain, domain, defaultSyncPolicy } from '../api';
import { defaultDeleteHandler, defaultPatchHandler, defaultPostHandler } from './handlers';

export function fetchDomainData(params) {
  return async dispatch => {
    try {
      const domainData = await dispatch(domains(params));
      if(!params?.offset) await dispatch({ type: DOMAIN_DATA_RECEIVED, data: domainData });
      else await dispatch({ type: DOMAIN_NEXT_SET, data: domainData });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchDomainDetails(id) {
  return async dispatch => {
    try {
      const domainData = await dispatch(domain(id));
      const defaultPolicy = await dispatch(defaultSyncPolicy());
      domainData.defaultPolicy = defaultPolicy.data;
      return Promise.resolve(domainData);
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function addDomainData(...endpointParams) {
  return defaultPostHandler(addDomain, DOMAIN_DATA_ADD, ...endpointParams);
}

export function editDomainData(...endpointParams) {
  return defaultPatchHandler(editDomain,  ...endpointParams);
}

export function deleteDomainData(id, params) {
  return defaultDeleteHandler(deleteDomain, DOMAIN_DATA_DELETE, {id, params});
}
