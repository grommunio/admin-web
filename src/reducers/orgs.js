// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  ORGS_DATA_RECEIVED,
  ORG_DATA_ADD,
  ORG_DATA_DELETE,
} from '../actions/types';
import { addItem, append } from '../utils';

const defaultState = {
  Orgs: [],
  count: 0,
};

function orgsReducer(state = defaultState, action) {
  switch (action.type) {
  case ORGS_DATA_RECEIVED:
    return {
      ...state,
      Orgs: action.offset ? append(state.Orgs, action.data.data) : action.data.data,
      count: action.data.count,
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

export default orgsReducer;
