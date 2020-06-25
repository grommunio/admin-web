import {
  MLISTS_DATA_ERROR,
  MLISTS_DATA_FETCH,
  MLISTS_DATA_RECEIVED,
} from '../actions/types';
import { mlists, addMlist, editMlist, deleteMlist } from '../api';

export function fetchMlistsData() {
  return async dispatch => {
    await dispatch({ type: MLISTS_DATA_FETCH });
    try {
      const response = await dispatch(mlists());
      await dispatch({ type: MLISTS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: MLISTS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function addMlistData(mlist) {
  return async dispatch => {
    try {
      await dispatch(addMlist(mlist));
    } catch(error) {
      await dispatch({ type: MLISTS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function editMlistData(mlist) {
  return async dispatch => {
    try {
      await dispatch(editMlist(mlist));
    } catch(error) {
      await dispatch({ type: MLISTS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function deleteMlistData(id) {
  return async dispatch => {
    try {
      await dispatch(deleteMlist(id));
    } catch(error) {
      await dispatch({ type: MLISTS_DATA_ERROR, error});
      console.error(error);
    }
  };
}