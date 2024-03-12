// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import {
  SPAM_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  stat: {
    scanned: 0,
    actions: {
      reject: 69,
      greylist: 69,
      "add header": 69,
      "no action": 420,
    }
  },
};

function statusReducer(state = defaultState, action) {
  switch (action.type) {
  case SPAM_DATA_RECEIVED:
    return {
      ...state,
      //stat: {
      //  ...action.data,
      //}  
    };

  default:
    return state;
  }
}

export default statusReducer;
