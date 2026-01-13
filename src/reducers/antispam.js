// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  ANTISPAM_DATA_RECEIVED,
  AUTH_AUTHENTICATED,
} from '../actions/types';

const defaultState = {
  statistics: {
    scanned: 0,
    learned: 0,
    spamCount: 0,
    hamCount: 0,
    bytesAllocated: 0,
  },
};

function antispamReducer(state = defaultState, action) {
  switch (action.type) {
  case ANTISPAM_DATA_RECEIVED:
    return {
      ...state,
      statistics: {
        scanned: action.data.scanned,
        learned: action.data.learned,
        spamCount: action.data.spam_count,
        hamCount: action.data.ham_count,
        bytesAllocated: action.data.bytes_allocated,
      },
    };

  case AUTH_AUTHENTICATED:
    return action.authenticated ? {
      ...state,
    } : {
      ...defaultState,
    };

  default:
    return state;
  }
}

export default antispamReducer;
