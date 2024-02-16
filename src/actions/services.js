// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  SERVICES_DATA_RECEIVED,
} from '../actions/types';
import { services, postServices } from '../api';
import { defaultListHandler, defaultPatchHandler } from './handlers';

export function fetchServicesData() {
  return defaultListHandler(services, SERVICES_DATA_RECEIVED);
}

export function serviceAction(...endpointParams) {
  return defaultPatchHandler(postServices, ...endpointParams);
}
