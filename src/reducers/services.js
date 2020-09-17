import {
  SERVICES_DATA_FETCH,
  SERVICES_DATA_RECEIVED,
  SERVICES_DATA_ERROR,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Services: [],
};

function domainsReducer(state = defaultState, action) {
  switch (action.type) {
    case SERVICES_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case SERVICES_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Services: action.data.services,
      };
    
    case SERVICES_DATA_ERROR:
      return {
        ...state,
        error: action.error,
      };

    default:
      return state;
  }
}

export default domainsReducer;
