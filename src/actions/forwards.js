// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  FORWARDS_DATA_ERROR,
  FORWARDS_DATA_FETCH,
  FORWARDS_DATA_RECEIVED,
} from '../actions/types';
import { forwards, addForward, editForward, deleteForward } from '../api';

export function fetchForwardsData() {
  return async dispatch => {
    await dispatch({ type: FORWARDS_DATA_FETCH });
    try {
      const response = await dispatch(forwards());
      await dispatch({ type: FORWARDS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: FORWARDS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function addForwardData(forward) {
  return async dispatch => {
    try {
      await dispatch(addForward(forward));
    } catch(error) {
      await dispatch({ type: FORWARDS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function editForwardData(forward) {
  return async dispatch => {
    try {
      await dispatch(editForward(forward));
    } catch(error) {
      await dispatch({ type: FORWARDS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function deleteForwardData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteForward(id));
    } catch(error) {
      await dispatch({ type: FORWARDS_DATA_ERROR, error});
      console.error(error);
    }
  };
}
