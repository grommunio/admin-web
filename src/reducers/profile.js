import {
  PROFILE_DATA_RECEIVED,
  PROFILE_DATA_FETCH,
  PROFILE_DATA_ERROR,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Profile: {},
};

function profileReducer(state = defaultState, action) {
  switch (action.type) {
    case PROFILE_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case PROFILE_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Profile: action.data,
      };
    
    case PROFILE_DATA_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error,
      };

    default:
      return state;
  }
}

export default profileReducer;
