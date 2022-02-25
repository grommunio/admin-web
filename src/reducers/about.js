// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  ABOUT_DATA_RECEIVED, AUTH_AUTHENTICATED,
} from '../actions/types';

const defaultState = {
  API: '69.42.0',
  backend: '1.3.3.7',
  schema: 69,
};

function aboutReducer(state = defaultState, action) {
  switch (action.type) {
    case ABOUT_DATA_RECEIVED:
      return {
        ...action.data,
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

export default aboutReducer;
