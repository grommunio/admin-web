// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  SYNC_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  count: 0,
  Sync: [],
};

function domainsReducer(state = defaultState, action) {
  switch (action.type) {

    case SYNC_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Sync: action.data,
      };


    default:
      return state;
  }
}

export default domainsReducer;
