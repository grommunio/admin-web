// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { Folder } from '@/types/folders';
import {
  FOLDER_DATA_ADD,
  FOLDER_DATA_DELETE,
  OWNERS_DATA_RECEIVED,
  OWNER_DATA_ADD,
  AUTH_AUTHENTICATED,
  OWNER_DATA_DELETE,
  FOLDERS_TREE_RECEIVED,
} from '../actions/types';
import { IPM_SUBTREE_ID } from '../constants';
import { addItem } from '../utils';
import { Owner } from '@/types/users';


type FoldersState = {
  moreDataAvailable: boolean;
  Tree: Folder;
  Owners: Owner[];
};


const defaultState: FoldersState = {
  moreDataAvailable: true,
  Tree: {} as Folder,
  Owners: [],
};

function addTreeItem(node: Folder, folder: Folder, parentID: string) {
  if(node.folderid === parentID) {
    if(node.children) {
      node.children.push({
        ...folder,
        name: folder.displayname
      });
    } else {
      node.children = [{
        ...folder,
        name: folder.displayname
      }];
    }
    return parentID === IPM_SUBTREE_ID ? node : true
  }
  node.children?.forEach(child => {
    if(addTreeItem(child, folder, parentID) === true) return;
  });
  return node;
}

function removeFolder(tree: Folder, folderid: string) {
  cutOffSubtree(tree, folderid);
  return structuredClone(tree);
}

function cutOffSubtree(node: Folder, folderid: string) {
  const children = [...(node.children || [])]
  for(let i = 0; i < children.length; i++) {
    if(node.children[i].folderid === folderid) {
      node.children.splice(i, 1);
      return node.folderid === IPM_SUBTREE_ID ? node : true;
    }
    if(cutOffSubtree(node.children[i], folderid)) return true;
  }
  return false;
}

function foldersReducer(state: FoldersState = defaultState, action: any) {
  switch (action.type) {

  case FOLDERS_TREE_RECEIVED:
    return {
      ...state,
      Tree: action.data,
    };

  case FOLDER_DATA_ADD:
    return {
      ...state,
      Tree: addTreeItem(structuredClone(state.Tree), action.data, action.parentID),
    };

  case FOLDER_DATA_DELETE:
    return {
      ...state,
      Tree: removeFolder(structuredClone(state.Tree), action.id),
    };

  case OWNERS_DATA_RECEIVED:
    return {
      ...state,
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
