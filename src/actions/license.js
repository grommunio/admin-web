// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  LICENSE_DATA_RECEIVED,
} from '../actions/types';
import { license, uploadLicense } from '../api';

export function fetchLicenseData() {
  return async dispatch => {
    try {
      const response = await dispatch(license());
      await dispatch({ type: LICENSE_DATA_RECEIVED, data: response });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function uploadLicenseData(license) {
  return async dispatch => {
    try {
      const response = await dispatch(uploadLicense(license));
      await dispatch({ type: LICENSE_DATA_RECEIVED, data: response });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
