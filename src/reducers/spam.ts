// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { AntiSpamResponse } from '@/types/antispam';
import {
  SPAM_DATA_RECEIVED,
  SPAM_HISTORY_RECEIVED,
} from '../actions/types';


export type AntispamState = {
  history: {
    version: number;
    rows: unknown[]; // TODO: Properly define when structure is known
  };
};

const defaultState: AntispamState = {
  history: {
    version: 0,
    rows: [],
  }
};

function spamReducer(state = defaultState, action) {
  switch (action.type) {
  case SPAM_DATA_RECEIVED:
    return {
      ...state,
      stat: {
        ...action.data,
      }
    };

  case SPAM_HISTORY_RECEIVED:
    return {
      ...state,
      history: {
        ...action.data,
        rows: action.data.rows?.map((r: AntiSpamResponse, id: string) => ({
          ...r,
          id,
          rcpt_smtp: r.rcpt_smtp?.join(", ") || "",
        })) || [],
      }
    }

  default:
    return state;
  }
}

export default spamReducer;
