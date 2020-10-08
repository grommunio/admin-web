import {
  ROLES_DATA_ERROR,
  ROLES_DATA_FETCH,
  ROLES_DATA_RECEIVED,
  PERMISSIONS_DATA_RECEIVED,
  ROLE_DATA_ADD,
  ROLE_DATA_DELETE,
} from '../actions/types';
import { addItem } from '../utils';

const defaultState = {
  loading: false,
  error: null,
  Roles: [],
  Permissions: [],
};

function rolesReducer(state = defaultState, action) {
  switch (action.type) {
    case ROLES_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case ROLES_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Roles: action.data.data,
      };
    
    case ROLES_DATA_ERROR: {
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    }

    case PERMISSIONS_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Permissions: action.data.data,
      };

    case ROLE_DATA_ADD:
      return {
        ...state,
        Roles: addItem(state.Roles, action.data),
      };

    case ROLE_DATA_DELETE:
      return {
        ...state,
        Roles: state.Roles.filter(role => role.ID === action.ID),
      };
    
    default:
      return state;
  }
}

export default rolesReducer;
