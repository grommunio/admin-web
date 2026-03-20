// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  LICENSE_DATA_RECEIVED,
} from '../actions/types';


type LicenseState = {
  certificate: string;
  currentUsers: number;
  maxUsers: number;
  notAfter: string;
  notBefore: string;
  product: string;
}

const defaultState: LicenseState = {
  certificate: "",
  currentUsers: 0,
  maxUsers: 0,
  notAfter: "",
  notBefore: "",
  product: "",
};

function licenseReducer(state: LicenseState = defaultState, action) {
  switch (action.type) {
  case LICENSE_DATA_RECEIVED:
    return {
      ...state,
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

export default licenseReducer;
