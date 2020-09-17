import {
  SERVICES_DATA_ERROR,
  SERVICES_DATA_FETCH,
  SERVICES_DATA_RECEIVED,
} from '../actions/types';
import { services, postServices } from '../api';

export function fetchServicesData() {
  return async dispatch => {
    await dispatch({ type: SERVICES_DATA_FETCH });
    try {
      const response = await dispatch(services());
      await dispatch({ type: SERVICES_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: SERVICES_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function serviceAction(service, action) {
  return async dispatch => {
    try {
      await dispatch(postServices(service, action));
    } catch(error) {
      await dispatch({ type: SERVICES_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}