// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  LICENSE_DATA_RECEIVED,
} from '../actions/types';
import { license, uploadLicense, licenseCreds, putLicenseCreds } from '../api';
import { defaultDetailsHandler, defaultListHandler, defaultPostHandler } from './handlers';

export function fetchLicenseData() {
  return defaultListHandler(license, LICENSE_DATA_RECEIVED);
}

export function uploadLicenseData(...endpointParams) {
  return defaultPostHandler(uploadLicense, LICENSE_DATA_RECEIVED, ...endpointParams);
}

export function submitLicenseCreds(...endpointParams) {
  return defaultDetailsHandler(putLicenseCreds, ...endpointParams)
}

export function getLicenseCreds(...endpointParams) {
  return defaultDetailsHandler(licenseCreds, ...endpointParams)
}
