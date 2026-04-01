// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { ActiveSyncSession } from '@/types/sync';
import {
  SYNC_DATA_RECEIVED,
} from '../actions/types';

type SyncState = {
  Sync: ActiveSyncSession[];
  count: number;
}

const defaultState: SyncState = {
  count: 0,
  Sync: [],
};

function syncReducer(state: SyncState = defaultState, action: any) {
  switch (action.type) {
  case SYNC_DATA_RECEIVED:
    return {
      ...state,
      Sync: action.data,
    };


  default:
    return state;
  }
}

export default syncReducer;
