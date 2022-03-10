// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  CLASSES_DATA_ADD,
  CLASSES_DATA_DELETE,
  CLASSES_DATA_ERROR,
  CLASSES_DATA_FETCH,
  CLASSES_DATA_RECEIVED,
  CLASSES_TREE_RECEIVED,
  CLASSES_SELECT_RECEIVED,
} from '../actions/types';
import { classes, addClass, editClass, deleteClass, classDetails, classesTree } from '../api';

export function fetchClassesData(domainID, params, select) {
  return async dispatch => {
    await dispatch({ type: CLASSES_DATA_FETCH });
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

export function fetchClassesTree(domainID, params) {
  return async dispatch => {
    await dispatch({ type: CLASSES_DATA_FETCH });
    try {
      const response = await dispatch(classesTree(domainID, params));
      await dispatch({ type: CLASSES_TREE_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: CLASSES_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}

export function fetchClassDetails(domainID, id) {
  return async dispatch => {
    await dispatch({ type: CLASSES_DATA_FETCH });
    try {
      const resp = await dispatch(classDetails(domainID, id));
      return Promise.resolve(resp);
    } catch(error) {
      await dispatch({ type: CLASSES_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}

export function addClassData(domainID, _class) {
  return async dispatch => {
    try {
      const resp = await dispatch(addClass(domainID, _class));
      if(resp) await dispatch({ type: CLASSES_DATA_ADD, data: resp });
    } catch(error) {
      await dispatch({ type: CLASSES_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}

export function editClassData(domainID, _class) {
  return async dispatch => {
    try {
      await dispatch(editClass(domainID, _class));
    } catch(error) {
      await dispatch({ type: CLASSES_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}

export function deleteClassData(domainID, id) {
  return async dispatch => {
    try {
      await dispatch(deleteClass(domainID, id));
      await dispatch({ type: CLASSES_DATA_DELETE, id });
    } catch(error) {
      await dispatch({ type: CLASSES_DATA_ERROR, error});
      return Promise.reject(error.message);
    }
  };
}
