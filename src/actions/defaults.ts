// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  CREATE_PARAMS_DATA_RECEIVED,
  URLParams,
} from './types';
import { createParams, editCreateParams } from '../api';
import { defaultListHandler, defaultPatchHandler } from './handlers';
import { CreateParams } from '@/types/defaults';


export function fetchCreateParamsData(domainID?: number | null, params?: { domain: number }) {
  return defaultListHandler(createParams, CREATE_PARAMS_DATA_RECEIVED, domainID, params);
}

export function editCreateParamsData(
  data: { user: CreateParams, domain?: CreateParams },
  domainID?: number | null,
  params?: URLParams
) {
  return defaultPatchHandler(editCreateParams, data, domainID, params);
}
