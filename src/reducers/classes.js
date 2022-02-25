// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  CLASSES_DATA_ADD,
  CLASSES_DATA_DELETE,
  CLASSES_DATA_ERROR,
  CLASSES_DATA_FETCH,
  CLASSES_DATA_RECEIVED,
  CLASSES_TREE_RECEIVED,
  CLASSES_SELECT_RECEIVED,
  AUTH_AUTHENTICATED,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  Classes: [],
  Trees: [],
  Select: [],
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

    case CLASSES_TREE_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Trees: action.data.data,
      };

    case CLASSES_SELECT_RECEIVED:
      return {
        ...state,
        Select: action.data.data,
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

export default classesReducer;
