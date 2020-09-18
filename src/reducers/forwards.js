import {
  FORWARDS_DATA_ERROR,
  FORWARDS_DATA_FETCH,
  FORWARDS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Forwards: [],
};

function forwardsReducer(state = defaultState, action) {
  switch (action.type) {
    case FORWARDS_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case FORWARDS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Forwards: action.data.data,
      };
    
    case FORWARDS_DATA_ERROR: {
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

export default forwardsReducer;
