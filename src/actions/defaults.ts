// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  CREATE_PARAMS_DATA_RECEIVED,
} from './types';
import { createParams, editCreateParams } from '../api';
import { defaultListHandler, defaultPatchHandler } from './handlers';

// TODO: Define defaults
export function fetchCreateParamsData(...endpointParams: any[]) {
  return defaultListHandler(createParams, CREATE_PARAMS_DATA_RECEIVED, ...endpointParams);
}

export function editCreateParamsData(...endpointParams: any[]) {
  return defaultPatchHandler(editCreateParams, ...endpointParams);
}
