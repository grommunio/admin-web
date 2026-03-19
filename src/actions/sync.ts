// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  SYNC_DATA_RECEIVED,
} from './types';
import { grommunioSync, remoteDeleteEngage, remoteResyncEngage, remoteWipeCancel, remoteWipeEngage } from '../api';
import { getTimeDiff } from '../utils';
import store from '../store';
import { defaultDetailsHandler, defaultPatchHandler } from './handlers';
import { Dispatch } from 'redux';
import { FetchSyncParams, RemoteWipeParams } from '@/types/sync';


export function fetchSyncData(params: FetchSyncParams) {
  return async (dispatch: Dispatch) => {
    try {
      let syncData = await grommunioSync(params);
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
      dispatch({ type: SYNC_DATA_RECEIVED, data: syncData });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function engageRemoteWipe(domainID: number, userID: number, deviceID: string, request: RemoteWipeParams) {
  return defaultPatchHandler(remoteWipeEngage, domainID, userID, deviceID, request);
}

export function cancelRemoteWipe(domainID: number, userID: number, deviceID: string) {
  return defaultPatchHandler(remoteWipeCancel, domainID, userID, deviceID);
}

export function engageResync(domainID: number, userID: number, deviceID: string) {
  return defaultDetailsHandler(remoteResyncEngage, domainID, userID, deviceID);
}

export function engageRemoteDelete(domainID: number, userID: number, deviceID: string) {
  return defaultDetailsHandler(remoteDeleteEngage, domainID, userID, deviceID);
}
