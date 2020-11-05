import {
  DRAWER_OPEN_DEFAULT,
  DRAWER_CLOSE_DEFAULT,
  DRAWER_EXPAND,
  DRAWER_CLOSE,
  DRAWER_SELECTION,
  DRAWER_DOMAINS_REVEICED,
  DRAWER_DOMAINS_FETCH,
} from '../actions/types';

const defaultState = {
  defaultOpen: false,
  expanded: false,
  selected: '',
  Domains: [],
  loading: true,
};

function drawerReducer(state = defaultState, action) {
  switch (action.type) {
    case DRAWER_EXPAND:
      return {
        ...state,
        expanded: !state.expanded,
      };

    case DRAWER_CLOSE:
      return {
        ...state,
        expanded: false,
      };

    case DRAWER_OPEN_DEFAULT:
      return {
        ...state,
        defaultOpen: true,  
      };

    case DRAWER_CLOSE_DEFAULT:
      return {
        ...state,
        defaultOpen: false,  
      };

    case DRAWER_SELECTION: {
      return {
        ...state,
        selected: action.page,
      };
    }

    case DRAWER_DOMAINS_FETCH:
      return {
        ...state,
        loading: true,
      };

    case DRAWER_DOMAINS_REVEICED:
      return {
        ...state,
        Domains: action.data.data,
        loading: false,
      };

    default:
      return state;
  }
}

export default drawerReducer;