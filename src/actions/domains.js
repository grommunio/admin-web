import {
  DOMAIN_DATA_ERROR,
  DOMAIN_DATA_FETCH,
  DOMAIN_DATA_RECEIVED,
  DOMAIN_DATA_ADD,
  DOMAIN_DATA_EDIT,
} from '../actions/types';
import { domains, addDomain, editDomain, deleteDomain } from '../api';

export function fetchDomainData() {
  return async dispatch => {
    await dispatch({ type: DOMAIN_DATA_FETCH });
    try {
      const domainData = await dispatch(domains());
      await dispatch({ type: DOMAIN_DATA_RECEIVED, data: domainData });
    } catch(error) {
      await dispatch({ type: DOMAIN_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function addDomainData(domain) {
  return async dispatch => {
    try {
      const domainData = await dispatch(addDomain(domain));
      await dispatch({ type: DOMAIN_DATA_ADD, data: domainData });
    } catch(error) {
      await dispatch({ type: DOMAIN_DATA_ERROR, error});
      console.error(error);
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
    }
  };
}

export function deleteDomainData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteDomain(id));
    } catch(error) {
      await dispatch({ type: DOMAIN_DATA_ERROR, error});
      console.error(error);
    }
  };
}