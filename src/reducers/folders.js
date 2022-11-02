// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  FOLDERS_DATA_FETCH,
  FOLDERS_DATA_RECEIVED,
  FOLDERS_DATA_ERROR,
  FOLDER_DATA_ADD,
  FOLDER_DATA_DELETE,
  OWNERS_DATA_RECEIVED,
  OWNER_DATA_ADD,
  FOLDERS_NEXT_SET,
  AUTH_AUTHENTICATED,
  OWNER_DATA_DELETE,
  FOLDERS_TREE_RECEIVED,
} from '../actions/types';
import { defaultFetchLimit } from '../constants';
import { addItem, append } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  moreDataAvailable: true,
  Folders: [],
  Tree: {},
  Owners: [],
};

function addTreeItem(node, folder, parentID) {
  if(node.folderid === parentID) {
    if(node.children) {
      node.children.push({ folderid: folder.folderid, name: folder.displayname });
    } else {
      node.children = [{ folderid: folder.folderid, name: folder.displayname }];
    }
    return true;
  }
  node.children?.forEach(child => {
    if(addTreeItem(child, folder, parentID) === true) return;
  });
  return node;
}

function removeFolder(tree, folderid) {
  cutOffSubtree(tree, folderid);
  return structuredClone(tree);
}

function cutOffSubtree(node, folderid) {
  const children = [...(node.children || [])]
  for(let i = 0; i < children.length; i++) {
    if(node.children[i].folderid === folderid) {
      node.children.splice(i, 1);
      return true;
    }
    if(cutOffSubtree(node.children[i], folderid)) return true;
  }
  return false;
}

function foldersReducer(state = defaultState, action) {
  switch (action.type) {
  case FOLDERS_DATA_FETCH:
    return {
      ...state,
      loading: true,
    };

  case FOLDERS_DATA_RECEIVED:
    return {
      ...state,
      loading: false,
      error: null,
      Folders: action.data.data,
      moreDataAvailable: action.data.data.length == defaultFetchLimit,
    };

  case FOLDERS_TREE_RECEIVED:
    return {
      ...state,
      loading: false,
      error: null,
      Tree: action.data,
    };
    
  case FOLDERS_NEXT_SET:
    return {
      ...state,
      loading: false,
      error: null,
      Folders: append(state.Folders, action.data.data),
      moreDataAvailable: action.data.data.length == defaultFetchLimit,
    };
    
  case FOLDERS_DATA_ERROR: {
    return {
      ...state,
      error: action.error,
      loading: false,
    };
  }

  case FOLDER_DATA_ADD:
    return {
      ...state,
      Folders: addItem(state.Folders, action.data),
      Tree: addTreeItem(state.Tree, action.data, action.parentID),
    };

  case FOLDER_DATA_DELETE:
    return {
      ...state,
      Folders: state.Folders.filter(folder => folder.folderid !== action.id),
      Tree: removeFolder(state.Tree, action.id),
    };

  case OWNERS_DATA_RECEIVED:
    return {
      ...state,
      loading: false,
      error: null,
      Owners: action.data.data,
    };

  case OWNER_DATA_ADD:
    return {
      ...state,
      Owners: addItem(state.Owners, action.data),
    };

  case OWNER_DATA_DELETE:
    return {
      ...state,
      Owners: state.Owners.filter(owner => owner.memberID !== action.id),
    };
    
  case AUTH_AUTHENTICATED:
    return action.authenticated ? {
      ...state,
    } : {
      ...defaultState,
    };

  default:
    return state;
  }
}

export default foldersReducer;
