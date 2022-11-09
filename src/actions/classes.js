// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  CLASSES_DATA_ADD,
  CLASSES_DATA_DELETE,
  CLASSES_DATA_ERROR,
  CLASSES_DATA_RECEIVED,
  CLASSES_TREE_RECEIVED,
  CLASSES_SELECT_RECEIVED,
} from '../actions/types';
import { classes, addClass, editClass, deleteClass, classDetails, classesTree } from '../api';
import { defaultDeleteHandler, defaultDetailsHandler, defaultListHandler,
  defaultPatchHandler, defaultPostHandler } from './handlers';

export function fetchClassesData(domainID, params, select) {
  return async dispatch => {
    try {
      const response = await dispatch(classes(domainID, params));
      await dispatch({
        type: select ? CLASSES_SELECT_RECEIVED : CLASSES_DATA_RECEIVED,
        data: response,
        offset: params?.offset,
      });
    } catch(error) {
      await dispatch({ type: CLASSES_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}

export function fetchClassesTree(...endpointParams) {
  return defaultListHandler(classesTree, CLASSES_TREE_RECEIVED, ...endpointParams);
}

export function fetchClassDetails(...endpointParams) {
  return defaultDetailsHandler(classDetails, ...endpointParams);
}

export function addClassData(...endpointParams) {
  return defaultPostHandler(addClass, CLASSES_DATA_ADD, ...endpointParams);
}

export function editClassData(...endpointParams) {
  return defaultPatchHandler(editClass, ...endpointParams);
}

export function deleteClassData(domainID, id) {
  return defaultDeleteHandler(deleteClass, CLASSES_DATA_DELETE, {domainID, id});
}
