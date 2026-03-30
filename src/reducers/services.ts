// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { Service } from '@/types/dashboard';
import {
  SERVICES_DATA_RECEIVED,
  AUTH_AUTHENTICATED,
} from '../actions/types';

type ServicesState = {
  Services: Service[];
}

const defaultState: ServicesState = {
  Services: [],
};

function domainsReducer(state: ServicesState = defaultState, action: any) {
  switch (action.type) {
  case SERVICES_DATA_RECEIVED:
    return {
      ...state,
      Services: action.data.services,
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

export default domainsReducer;
