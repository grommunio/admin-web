// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  LICENSE_DATA_RECEIVED,
} from '../actions/types';


const defaultState = {
  License: {},
};

function licenseReducer(state = defaultState, action) {
  switch (action.type) {
    case LICENSE_DATA_RECEIVED:
      return {
        ...state,
        License: action.data,
      };

    default:
      return state;
  }
}

export default licenseReducer;
