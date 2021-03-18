// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  FOLDERS_DATA_ERROR,
  FOLDERS_DATA_FETCH,
  FOLDERS_DATA_RECEIVED,
  FOLDER_DATA_ADD,
  FOLDER_DATA_DELETE,
  OWNERS_DATA_RECEIVED,
  OWNER_DATA_ADD,
  FOLDERS_NEXT_SET,
} from './types';
import { folders, addFolder, editFolder, deleteFolder, owners, addOwner, deleteOwner } from '../api';

export function fetchFolderData(domainID, params) {
  return async dispatch => {
    await dispatch({ type: FOLDERS_DATA_FETCH });
    try {
      const response = await dispatch(folders(domainID, params));
      if(!params.offset) await dispatch({ type: FOLDERS_DATA_RECEIVED, data: response });
      else await dispatch({ type: FOLDERS_NEXT_SET, data: response });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchFolderDetails(domainID, folderID) {
  return async dispatch => {
    try {
      const foldersData = await dispatch(folders(domainID, {}));
      // eslint-disable-next-line
      const folder = foldersData.data.find(f => f.folderid == folderID);
      return folder ? Promise.resolve(folder) : Promise.reject('Folder not found');
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function addFolderData(domainID, folder) {
  return async dispatch => {
    const owners = folder.owners;
    delete folder.owners;
    try {
      const folderData = await dispatch(addFolder(domainID, folder));
      await dispatch({ type: FOLDER_DATA_ADD, data: folderData });
      for(let i = 0; i < owners.length; i++) {
        await dispatch(addOwner(domainID, folderData.folderid, { username: owners[i] }));
      }
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error });
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
      await dispatch({ type: FOLDER_DATA_DELETE, id });
    } catch(error) {
      await dispatch({ type: FOLDERS_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchOwnersData(domainID, folderID, params) {
  return async dispatch => {
    await dispatch({ type: FOLDERS_DATA_FETCH });
    try {
      const response = await dispatch(owners(domainID, folderID, params));
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
