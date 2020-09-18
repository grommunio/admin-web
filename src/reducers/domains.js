import {
  DOMAIN_DATA_FETCH,
  DOMAIN_DATA_RECEIVED,
  DOMAIN_DATA_ERROR,
  DOMAIN_DATA_ADD,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  Domains: [],
};

function domainsReducer(state = defaultState, action) {
  switch (action.type) {
    case DOMAIN_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case DOMAIN_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Domains: action.data.data,
      };
    
    case DOMAIN_DATA_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };

    case DOMAIN_DATA_ADD:
      return {
        ...state,
        Domains: addItem(state.Domains, action.data),
      };

    default:
      return state;
  }
}

export default domainsReducer;
