import {
  SYNC_DATA_RECEIVED,
} from './types';
import { grammmSync } from '../api';
import { getTimeDiff } from '../utils';
import store from '../store';

export function fetchSyncData(params) {
  return async dispatch => {
    try {
      let syncData = await dispatch(grammmSync(params));
      const currentState = store.getState().sync.Sync;
      const currentLength = currentState.length;
      syncData = syncData.data;
      syncData = syncData.map((r, idx) => {
        return {
          ...r,
          diff: getTimeDiff(r.update),
          justUpdated: idx < currentLength ? currentState[idx].update !== r.update : false,
        };
      });
      await dispatch({ type: SYNC_DATA_RECEIVED, data: syncData });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}