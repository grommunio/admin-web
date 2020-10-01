import {
  FOLDERS_DATA_ERROR,
  FOLDERS_DATA_FETCH,
  FOLDERS_DATA_RECEIVED,
  FOLDER_DATA_ADD,
  OWNERS_DATA_RECEIVED,
  OWNER_DATA_ADD,
} from './types';
import { folders, addFolder, editFolder, deleteFolder, owners, addOwner, deleteOwner } from '../api';

export function fetchFolderData(domainID) {
  return async dispatch => {
    await dispatch({ type: FOLDERS_DATA_FETCH });
    try {
      const response = await dispatch(folders(domainID));
      await dispatch({ type: FOLDERS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function addFolderData(domainID, folder) {
  return async dispatch => {
    try {
      const folderData = await dispatch(addFolder(domainID, folder));
      await dispatch({ type: FOLDER_DATA_ADD, data: folderData });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
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
      return Promise.reject(error.message);
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
      return Promise.reject(error.message);
    }
  };
}

export function fetchOwnersData(domainID, folderID) {
  return async dispatch => {
    await dispatch({ type: FOLDERS_DATA_FETCH });
    try {
      const response = await dispatch(owners(domainID, folderID));
      await dispatch({ type: OWNERS_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function addOwnerData(domainID, folderID, username) {
  return async dispatch => {
    try {
      await dispatch(addOwner(domainID, folderID, username));
      await dispatch({ type: OWNER_DATA_ADD, data: { displayName: username.username } });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteOwnerData(domainID, folderID, member) {
  return async dispatch => {
    try {
      await dispatch(deleteOwner(domainID, folderID, member));
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
