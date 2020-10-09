import {
  AUTH_AUTHENTICATING,
  AUTH_AUTHENTICATED,
  AUTH_ERROR,
} from '../actions/types';
import { SYS_ADMIN, DOM_ADMIN } from '../constants';

const defaultState = {
  error: false,
  authenticated: false,     
  authenticating: true,
  role: SYS_ADMIN,
};

function authReducer(state = defaultState, action) {
  switch (action.type) {
    case AUTH_AUTHENTICATING:
      return {
        ...state,
        authenticating: action.authenticating,
        error: false,
      };

    case AUTH_AUTHENTICATED:
      return {
        ...state,
        authenticated: action.authenticated,
        role: action.role || DOM_ADMIN,
        error: false,
      };
    
    case AUTH_ERROR: {
      return {
        ...state,
        authenticated: false,
        error: true,
      };
    }

    default:
      return state;
  }
}

export default authReducer;
