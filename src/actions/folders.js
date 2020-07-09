import {
  FOLDERS_DATA_ERROR,
  FOLDERS_DATA_FETCH,
  FOLDERS_DATA_RECEIVED,
} from './types';
import { folders, addFolder, editFolder, deleteFolder } from '../api';

export function fetchFolderData(domainID) {
  return async dispatch => {
    await dispatch({ type: FOLDERS_DATA_FETCH });
    try {
      const response = await dispatch(folders(domainID));
      await dispatch({ type: FOLDERS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function addFolderData(domainID, folder) {
  return async dispatch => {
    try {
      await dispatch(addFolder(domainID, folder));
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function editFolderData(domainID, folder) {
  return async dispatch => {
    try {
      await dispatch(editFolder(domainID, folder));
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}

export function deleteFolderData(domainID, id) {
  return async dispatch => {
    try {
      await dispatch(deleteFolder(domainID, id));
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
    }
  };
}