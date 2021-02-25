// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  MLISTS_DATA_ERROR,
  MLISTS_DATA_FETCH,
  MLISTS_DATA_RECEIVED,
  MLIST_DATA_ADD,
  MLIST_DATA_DELETE,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  MLists: [],
  count: 0,
};

function mlistsReducer(state = defaultState, action) {
  switch (action.type) {
    case MLISTS_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case MLISTS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        MLists: action.data.data,
        count: action.data.count,
      };
    
    case MLISTS_DATA_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    }

    case MLIST_DATA_ADD:
      return {
        ...state,
        MLists: addItem(state.MLists, action.data),
      };

    case MLIST_DATA_DELETE:
      return {
        ...state,
        MLists: state.MLists.filter(ml => ml.ID !== action.id),
      };

    default:
      return state;
  }
}

export default mlistsReducer;
