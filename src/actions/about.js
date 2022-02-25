// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  ABOUT_DATA_RECEIVED,
} from '../actions/types';
import { about } from '../api';

export function fetchAboutData() {
  return async dispatch => {
    try {
      const data = await dispatch(about());
      await dispatch({ type: ABOUT_DATA_RECEIVED, data });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
