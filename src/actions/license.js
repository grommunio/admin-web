// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  LICENSE_DATA_RECEIVED,
} from '../actions/types';
import { license, uploadLicense } from '../api';
import { defaultListHandler, defaultPostHandler } from './handlers';

export function fetchLicenseData() {
  return defaultListHandler(license, LICENSE_DATA_RECEIVED);
}

export function uploadLicenseData(...endpointParams) {
  return defaultPostHandler(uploadLicense, LICENSE_DATA_RECEIVED, ...endpointParams);
}
