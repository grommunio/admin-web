// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  ANTISPAM_DATA_ERROR,
  ANTISPAM_DATA_FETCH,
  ANTISPAM_DATA_RECEIVED,
} from '../actions/types';
import { antispam } from '../api';

export function fetchAntispamData() {
  return async dispatch => {
    await dispatch({ type: ANTISPAM_DATA_FETCH });
    try {
      const antispamData = await dispatch(antispam());
      await dispatch({ type: ANTISPAM_DATA_RECEIVED, data: {...antispamData }});
    } catch(error) {
      await dispatch({ type: ANTISPAM_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}