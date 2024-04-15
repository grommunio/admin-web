// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import {
  SPAM_DATA_RECEIVED,
  SPAM_THROUGHPUT_RECEIVED,
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
  throughput: [
    { name: "reject", data: [] },
    { name: "soft reject", data: [] },
    { name: "rewrite subject", data: [] },
    { name: "add header", data: [] },
    { name: "greyheader", data: [] },
    { name: "no action", data: [] },
  ]
};

const formatThroughput = raw => {
  return [
    { name: "reject", data: raw[0].map(o => o.y) },
    { name: "soft reject", data: raw[1].map(o => o.y) },
    { name: "rewrite subject", data: raw[2].map(o => o.y) },
    { name: "add header", data: raw[3].map(o => o.y) },
    { name: "greyheader", data: raw[4].map(o => o.y) },
    { name: "no action", data: raw[5].map(o => o.y) },
  ]
} 

function statusReducer(state = defaultState, action) {
  switch (action.type) {
  case SPAM_DATA_RECEIVED:
    return {
      ...state,
      stat: {
        ...action.data,
      }
    };
  
  case SPAM_THROUGHPUT_RECEIVED:
    return {
      ...state,
      throughput: formatThroughput(action.data),
    };

  default:
    return state;
  }
}

export default statusReducer;
