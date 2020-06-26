import {
  CLASSES_DATA_ERROR,
  CLASSES_DATA_FETCH,
  CLASSES_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Classes: [],
};

function classesReducer(state = defaultState, action) {
  switch (action.type) {
    case CLASSES_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case CLASSES_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Classes: action.data.data,
      };
    
    case CLASSES_DATA_ERROR: {
      return {
        ...state,
        error: action.error,
      };
    }

    default:
      return state;
  }
}

export default classesReducer;