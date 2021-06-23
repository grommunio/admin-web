import {
  SYNC_DATA_RECEIVED,
} from './types';
import { grammmSync } from '../api';

export function fetchSyncData(params) {
  return async dispatch => {
    try {
      const syncData = await dispatch(grammmSync(params));
      await dispatch({ type: SYNC_DATA_RECEIVED, data: syncData });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}