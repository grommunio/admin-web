// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  SYNC_DATA_RECEIVED,
} from '../actions/types';

type Sync = {
  devtype: string;
  devagent: string;
  diff: string;
  pid: string;
  ip: string;
  user: string;
  command: string;
  devid: string;
  asversion: string;
  addinfo: string;
  push: boolean;
}

type SyncState = {
  Sync: Sync[];
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
