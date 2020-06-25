import {
  CLASSES_DATA_ERROR,
  CLASSES_DATA_FETCH,
  CLASSES_DATA_RECEIVED,
} from '../actions/types';
import { classes, addClass, editClass, deleteClass } from '../api';

export function fetchClassesData() {
  return async dispatch => {
    await dispatch({ type: CLASSES_DATA_FETCH });
    try {
      const response = await dispatch(classes());
      await dispatch({ type: CLASSES_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: CLASSES_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function addClassData(Class) {
  return async dispatch => {
    try {
      await dispatch(addClass(Class));
    } catch(error) {
      await dispatch({ type: CLASSES_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function editClassData(Class) {
  return async dispatch => {
    try {
      await dispatch(editClass(Class));
    } catch(error) {
      await dispatch({ type: CLASSES_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function deleteClassData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteClass(id));
    } catch(error) {
      await dispatch({ type: CLASSES_DATA_ERROR, error});
      console.error(error);
    }
  };
}