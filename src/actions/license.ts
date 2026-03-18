// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  LICENSE_DATA_RECEIVED,
} from './types';
import { license, uploadLicense, licenseCreds, putLicenseCreds } from '../api';
import { defaultDetailsHandler, defaultListHandler, defaultPostHandler } from './handlers';

export function fetchLicenseData() {
  return defaultListHandler(license, LICENSE_DATA_RECEIVED);
}

export function uploadLicenseData(license: File) {
  return defaultPostHandler(uploadLicense, LICENSE_DATA_RECEIVED, license);
}

export function submitLicenseCreds(creds: { username: string, password: string }) {
  return defaultDetailsHandler(putLicenseCreds, creds)
}

export function getLicenseCreds() {
  return defaultDetailsHandler(licenseCreds)
}
