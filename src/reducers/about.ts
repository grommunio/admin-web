// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  ABOUT_DATA_RECEIVED, AUTH_AUTHENTICATED,
} from '../actions/types';
import { LegacyAction } from './types';

type AboutState = {
  API: string,
  backend: string,
  schema: number,
}

const defaultState: AboutState = {
  API: '69.42.0',
  backend: '1.3.3.7',
  schema: 69,
};

function aboutReducer(state: AboutState = defaultState, action: LegacyAction) {
  switch (action.type) {
  case ABOUT_DATA_RECEIVED:
    return {
      API: action.data.API ?? "",
      backend: action.data.backend ?? "",
      schema: action.data.schema ?? "",
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
