import {
  CREATE_PARAMS_DATA_FETCH,
  CREATE_PARAMS_DATA_RECEIVED,
} from './types';
import { createParams, editCreateParams } from '../api';
import { defaultListHandler, defaultPatchHandler } from './handlers';

export function fetchCreateParamsData(...endpointParams) {
  return defaultListHandler(createParams, CREATE_PARAMS_DATA_RECEIVED, CREATE_PARAMS_DATA_FETCH, ...endpointParams);
}

export function editCreateParamsData(...endpointParams) {
  return defaultPatchHandler(editCreateParams, ...endpointParams);
}
