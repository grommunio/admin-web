import {
  AREAS_DATA_ERROR,
  AREAS_DATA_FETCH,
  AREAS_DATA_RECEIVED,
  AREA_DATA_ADD,
} from '../actions/types';
import { dataArea, addDataArea, deleteDataArea } from '../api';

export function fetchAreasData() {
  return async dispatch => {
    await dispatch({ type: AREAS_DATA_FETCH });
    try {
      const areaData = await dataArea();
      await dispatch({ type: AREAS_DATA_RECEIVED, data: areaData });
    } catch(error) {
      await dispatch({ type: AREAS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function addAreaData(area) {
  return async dispatch => {
    try {
      const areaData = await addDataArea(area);
      await dispatch({ type: AREA_DATA_ADD, data: areaData });
    } catch(error) {
      await dispatch({ type: AREAS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteAreaData(id) {
  return async dispatch => {
    try {
      await deleteDataArea(id);
    } catch(error) {
      await dispatch({ type: AREAS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}