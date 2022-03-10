// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  DOMAIN_DATA_ERROR,
  DOMAIN_DATA_FETCH,
  DOMAIN_DATA_RECEIVED,
  DOMAIN_DATA_ADD,
  DOMAIN_DATA_EDIT,
  DOMAIN_NEXT_SET,
  DOMAIN_DATA_DELETE,
} from '../actions/types';
import { domains, addDomain, editDomain, deleteDomain, domain, defaultSyncPolicy } from '../api';

export function fetchDomainData(params) {
  return async dispatch => {
    await dispatch({ type: DOMAIN_DATA_FETCH });
    try {
      const domainData = await dispatch(domains(params));
      if(!params?.offset) await dispatch({ type: DOMAIN_DATA_RECEIVED, data: domainData });
      else await dispatch({ type: DOMAIN_NEXT_SET, data: domainData });
    } catch(error) {
      await dispatch({ type: DOMAIN_DATA_ERROR, error});
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
      await dispatch({ type: DOMAIN_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function addDomainData(domain, params) {
  return async dispatch => {
    try {
      const domainData = await dispatch(addDomain(domain, params));
      await dispatch({ type: DOMAIN_DATA_ADD, data: domainData });
    } catch(error) {
      await dispatch({ type: DOMAIN_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function editDomainData(domain) {
  return async dispatch => {
    try {
      const domainData = await dispatch(editDomain(domain));
      await dispatch({ type: DOMAIN_DATA_EDIT, data: domainData });
    } catch(error) {
      await dispatch({ type: DOMAIN_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteDomainData(id, params) {
  return async dispatch => {
    try {
      await dispatch(deleteDomain(id, params));
      await dispatch({ type: DOMAIN_DATA_DELETE, id, purge: params.purge });
    } catch(error) {
      await dispatch({ type: DOMAIN_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
