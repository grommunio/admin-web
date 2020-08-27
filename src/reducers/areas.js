import {
  AREAS_DATA_ERROR,
  AREAS_DATA_FETCH,
  AREAS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Areas: {
    user: [],
    domain: [],
    independent: [],
  },
};

function areasReducer(state = defaultState, action) {
  switch (action.type) {
    case AREAS_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case AREAS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Areas: action.data,
      };
    
    case AREAS_DATA_ERROR:
      return {
        ...state,
        error: action.error,
      };

    default:
      return state;
  }
}

export default areasReducer;
