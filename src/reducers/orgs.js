import {
  ORGS_DATA_ERROR,
  ORGS_DATA_FETCH,
  ORGS_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Orgs: [],
};

function associationsReducer(state = defaultState, action) {
  switch (action.type) {
    case ORGS_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case ORGS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Orgs: action.data.data,
      };
    
    case ORGS_DATA_ERROR: {
      return {
        ...state,
        error: action.error,
      };
    }

    default:
      return state;
  }
}

export default associationsReducer;
