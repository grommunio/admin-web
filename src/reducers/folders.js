import {
  FOLDERS_DATA_FETCH,
  FOLDERS_DATA_RECEIVED,
  FOLDERS_DATA_ERROR,
  FOLDER_DATA_ADD,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  Folders: [],
};

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
      };
    
    case FOLDERS_DATA_ERROR: {
      return {
        ...state,
        error: action.error,
        Folders: [],
      };
    }

    case FOLDER_DATA_ADD:
      return {
        ...state,
        Folders: addItem(state.Folders, action.data),
      };

    default:
      return state;
  }
}

export default foldersReducer;
