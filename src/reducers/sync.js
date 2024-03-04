// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  SYNC_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  count: 0,
  Sync: [],
};

function syncReducer(state = defaultState, action) {
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
