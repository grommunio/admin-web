// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  MEMBERS_DATA_ERROR,
  MEMBERS_DATA_FETCH,
  MEMBERS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Members: [],
};

function membersReducer(state = defaultState, action) {
  switch (action.type) {
    case MEMBERS_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case MEMBERS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Members: action.data.data,
      };
    
    case MEMBERS_DATA_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    }

    default:
      return state;
  }
}

export default membersReducer;
