// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import { mailq, flush, deleteMailq, requeueMailq } from '../api';
import { defaultDetailsHandler } from './handlers';

export function fetchMailQData() {
  return defaultDetailsHandler(mailq);
}

export function flushMailQData(...endpointParams) {
  return defaultDetailsHandler(flush, ...endpointParams);
}

export function deleteMailQData(...endpointParams) {
  return defaultDetailsHandler(deleteMailq, ...endpointParams);
}

export function requeueMailQData(...endpointParams) {
  return defaultDetailsHandler(requeueMailq, ...endpointParams);
}
