import {
  USER_ALIASES_DATA_ERROR,
  USER_ALIASES_DATA_FETCH,
  USER_ALIASES_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Aliases: {},
};

function userAliasesReducer(state = defaultState, action) {
  switch (action.type) {
    case USER_ALIASES_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case USER_ALIASES_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Aliases: action.data.data,
      };
    
    case USER_ALIASES_DATA_ERROR: {
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

export default userAliasesReducer;
