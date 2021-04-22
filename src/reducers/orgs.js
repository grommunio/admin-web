// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  AUTH_AUTHENTICATED,
  ORGS_DATA_ERROR,
  ORGS_DATA_FETCH,
  ORGS_DATA_RECEIVED,
  ORG_DATA_ADD,
  ORG_DATA_DELETE,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  Orgs: [],
  count: 0,
};

function associationsReducer(state = defaultState, action) {
  switch (action.type) {
    case ORGS_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case ORGS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Orgs: action.data.data,
        count: action.data.count,
      };
    
    case ORGS_DATA_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
      };

    case ORG_DATA_ADD:
      return {
        ...state,
        Orgs: addItem(state.Orgs, action.data),
        count: state.count + 1,
      };

    case ORG_DATA_DELETE:
      return {
        ...state,
        Orgs: state.Orgs.filter(o => o.ID !== action.id),
        count: state.count - 1,
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

export default associationsReducer;
