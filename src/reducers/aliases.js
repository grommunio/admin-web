import {
  ALIASES_DATA_ERROR,
  ALIASES_DATA_FETCH,
  ALIASES_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Aliases: {},
};

function aliasesReducer(state = defaultState, action) {
  switch (action.type) {
    case ALIASES_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case ALIASES_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Aliases: action.data.data,
      };
    
    case ALIASES_DATA_ERROR: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }

    default:
      return state;
  }
}

export default aliasesReducer;
