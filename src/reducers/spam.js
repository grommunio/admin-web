// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import {
  SPAM_DATA_RECEIVED,
  SPAM_HISTORY_RECEIVED,
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
  ],
  history: {
    version: 0,
    rows: [],
  }
  // throughputTable: {}
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

/*const formatThroughputTable = raw => {
  const totals = {
    "reject": raw[0].reduce((prev, value) => prev + value.y, 0),
    "soft reject": raw[1].reduce((prev, value) => prev + value.y, 0),
    "rewrite subject": raw[2].reduce((prev, value) => prev + value.y, 0),
    "add header": raw[3].reduce((prev, value) => prev + value.y, 0),
    "greyheader": raw[4].reduce((prev, value) => prev + value.y, 0),
    "no action": raw[5].reduce((prev, value) => prev + value.y, 0),
  }

  const yValues = {
    "reject": raw[0].map(o => o.y),
    "soft reject": raw[1].map(o => o.y),
    "rewrite subject": raw[2].map(o => o.y),
    "add header": raw[3].map(o => o.y),
    "greyheader": raw[4].map(o => o.y),
    "no action": raw[5].map(o => o.y),
  }

  return [
    {
      name: "reject",
      messages: totals["reject"],
    },
    { name: "soft reject", messages: totals["soft reject"] },
    { name: "rewrite subject", messages: totals["rewrite reject"] },
    { name: "add header", messages: totals["add header"] },
    { name: "greyheader", messages: totals["greyheader"] },
    { name: "no action", messages: totals["no action"] },
  ]
}*/

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
      //throughputTable: formatThroughputTable(action.data),
    };

  case SPAM_HISTORY_RECEIVED:
    return {
      ...state,
      history: {
        ...action.data,
      }
    }

  default:
    return state;
  }
}

export default statusReducer;
