// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  DOMAIN_DATA_RECEIVED,
  DOMAIN_DATA_ADD,
  DOMAIN_NEXT_SET,
  DOMAIN_DATA_DELETE,
  URLParams,
} from './types';
import { domains, addDomain, editDomain, deleteDomain, domain, defaultSyncPolicy, dns } from '../api';
import { defaultDeleteHandler, defaultPatchHandler, defaultPostHandler } from './handlers';
import { Dispatch } from 'redux';
import { CreateDomainParams, DeleteDomainProps, NewDomain, UpdateDomain } from '@/types/domains';
import { ApiError } from '@/types/common';


export function fetchDomainData(params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const domainData = await domains(params);
      if(!params?.offset) dispatch({ type: DOMAIN_DATA_RECEIVED, data: domainData });
      else dispatch({ type: DOMAIN_NEXT_SET, data: domainData });
    } catch(err) {
      console.error(err);
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function fetchDomainDetails(id: number) {
  return async () => {
    try {
      const domainData = await domain(id);
      const defaultPolicy = await defaultSyncPolicy();
      domainData.defaultPolicy = defaultPolicy.data;
      return Promise.resolve(domainData);
    } catch(err) {
      console.error(err);
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}

export function addDomainData(domain: NewDomain, params: CreateDomainParams) {
  return defaultPostHandler(addDomain, DOMAIN_DATA_ADD, domain, params);
}

export function editDomainData(domain: UpdateDomain) {
  return defaultPatchHandler(editDomain, domain);
}

export function deleteDomainData(id: number, params: DeleteDomainProps) {
  return defaultDeleteHandler(deleteDomain, DOMAIN_DATA_DELETE, {id, params});
}

export function fetchDnsCheckData(domainID: number) {
  return async () => {
    try {
      const resp = await dns(domainID);
      return Promise.resolve(resp);
    } catch(err) {
      const message = (err as ApiError).message;
      return Promise.reject(message);
    }
  };
}
