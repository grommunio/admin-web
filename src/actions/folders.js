import {
  FOLDERS_DATA_ERROR,
  FOLDERS_DATA_FETCH,
  FOLDERS_DATA_RECEIVED,
} from './types';
import { folders, addFolder, editFolder, deleteFolder } from '../api';

export function fetchFolderData(domain) {
  return async dispatch => {
    await dispatch({ type: FOLDERS_DATA_FETCH });
    try {
      const response = await dispatch(folders(domain));
      await dispatch({ type: FOLDERS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function addFolderData(domain, folder) {
  return async dispatch => {
    try {
      await dispatch(addFolder(domain, folder));
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function editFolderData(domain, folder) {
  return async dispatch => {
    try {
      await dispatch(editFolder(domain, folder));
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function deleteFolderData(domain, id) {
  return async dispatch => {
    try {
      await dispatch(deleteFolder(domain, id));
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}