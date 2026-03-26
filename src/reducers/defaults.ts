// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { CreateParams } from '@/types/defaults';
import {
  AUTH_AUTHENTICATED,
  CREATE_PARAMS_DATA_RECEIVED,
} from '../actions/types';
import { LegacyAction } from './types';

type DefaultState = {
  CreateParams: {
    user: CreateParams;
    domain: CreateParams;
  }
}

const defaultState: DefaultState = {
  CreateParams: {
    user: {},
    domain: {},
  },
};

function defaultsReducer(state: DefaultState = defaultState, action: LegacyAction) {
  switch (action.type) {
  case CREATE_PARAMS_DATA_RECEIVED:
    return {
      ...state,
      CreateParams: action.data.data,
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

export default defaultsReducer;
