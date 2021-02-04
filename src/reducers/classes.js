// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  CLASSES_DATA_ADD,
  CLASSES_DATA_DELETE,
  CLASSES_DATA_ERROR,
  CLASSES_DATA_FETCH,
  CLASSES_DATA_RECEIVED,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  Classes: [{ID: 1, name: 'heh'}],
  count: 0,
};

function classesReducer(state = defaultState, action) {
  switch (action.type) {
    case CLASSES_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case CLASSES_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Classes: action.data.data,
        count: action.data.count,
      };
    
    case CLASSES_DATA_ERROR: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }

    case CLASSES_DATA_DELETE:
      return {
        ...state,
        Classes: state.Classes.filter(c => c.ID !== action.id),
        count: state.count - 1,
      };

    case CLASSES_DATA_ADD:
      return {
        ...state,
        Classes: addItem(state.Classes, action.data),
      };

    default:
      return state;
  }
}

export default classesReducer;
