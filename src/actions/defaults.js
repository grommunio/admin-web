import {
  CREATE_PARAMS_DATA_FETCH,
  CREATE_PARAMS_DATA_RECEIVED,
} from './types';
import { createParams, editCreateParams } from '../api';

export function fetchCreateParamsData(domainID, params) {
  return async dispatch => {
    await dispatch({ type: CREATE_PARAMS_DATA_FETCH });
    try {
      const orgData = await dispatch(createParams(domainID, params));
      await dispatch({ type: CREATE_PARAMS_DATA_RECEIVED, data: orgData });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function editCreateParamsData(data, domainID, params) {
  return async dispatch => {
    try {
      await dispatch(editCreateParams(data, domainID, params));
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
