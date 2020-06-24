import {
  MLISTS_DATA_ERROR,
  MLISTS_DATA_FETCH,
  MLISTS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Mlists: [],
};

function mlistsReducer(state = defaultState, action) {
  switch (action.type) {
    case MLISTS_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case MLISTS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Mlists: action.data.data,
      };
    
    case MLISTS_DATA_ERROR: {
      return {
        ...state,
        error: action.error,
      };
    }

    default:
      return state;
  }
}

export default mlistsReducer;
