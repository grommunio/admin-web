// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  FOLDER_DATA_ADD,
  FOLDER_DATA_DELETE,
  OWNERS_DATA_RECEIVED,
  FOLDERS_TREE_RECEIVED,
  URLParams,
} from './types';
import { folderDetails, addFolder, editFolder, deleteFolder, owners, addOwner,
  putFolderPermissions, deleteOwner, folderTree } from '../api';
import { defaultDetailsHandler, defaultListHandler, defaultListHandler2, defaultPatchHandler } from './handlers';
import { Folder } from '@/types/folders';
import { Dispatch } from 'redux';
import { User } from '@/types/users';


export function fetchFolderTree(...endpointParams: any[]) {
  return defaultListHandler(folderTree, FOLDERS_TREE_RECEIVED, ...endpointParams);
}

export function fetchFolderDetails(...endpointParams: any[]) {
  return defaultDetailsHandler(folderDetails, ...endpointParams);
}

export function addFolderData(domainID: number, folder: Folder) {
  return async (dispatch: Dispatch) => {
    const owners = folder.owners;
    delete folder.owners;
    try {
      const folderData = await addFolder(domainID, folder);
      dispatch({ type: FOLDER_DATA_ADD, data: folderData, parentID: folder.parentID });
      for(let i = 0; i < owners.length; i++) {
        await addOwner(domainID, folderData.folderid, { username: owners[i].username });
      }
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function editFolderData(...endpointParams: any[]) {
  return defaultPatchHandler(editFolder, ...endpointParams);
}

export function deleteFolderData(domainID: number, folderID: string, params: URLParams) {
  return async (dispatch: Dispatch) => {
    try {
      const resp = await deleteFolder(domainID, folderID, params);
      if(resp?.taskID) return resp;
      dispatch({ type: FOLDER_DATA_DELETE, id: folderID });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchOwnersData(...endpointParams: any[]) {
  return defaultListHandler2(owners, OWNERS_DATA_RECEIVED, ...endpointParams);
}

export function addOwnerData(domainID: number, folderID: string, ownersData: User[]) {
  return async (dispatch: Dispatch) => {
    try {
      for(let i = 0; i < ownersData.length; i++) {
        await addOwner(domainID, folderID, { username: ownersData[i].username });
      }
      const response = await owners(domainID, folderID, { limit: 1000000, level: 0 });
      dispatch({ type: OWNERS_DATA_RECEIVED, data: response });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

// TODO: Create permissions type
export function setFolderPermissions(domainID: number, folderID: string, memberID: number, permissions: any) {
  return async (dispatch: Dispatch) => {
    try {
      await putFolderPermissions(domainID, folderID, memberID, permissions);
      const response = await owners(domainID, folderID, { limit: 1000000, level: 0 });
      dispatch({ type: OWNERS_DATA_RECEIVED, data: response });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function deleteOwnerData(domainID: number, folderID: string, memberID: number) {
  return async (dispatch: Dispatch) => {
    try {
      await deleteOwner(domainID, folderID, memberID);
      const response = await owners(domainID, folderID, { limit: 1000000, level: 0 });
      dispatch({ type: OWNERS_DATA_RECEIVED, data: response });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
