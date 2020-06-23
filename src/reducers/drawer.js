import {
  DRAWER_OPEN_DEFAULT,
  DRAWER_CLOSE_DEFAULT,
  DRAWER_EXPAND,
  DRAWER_CLOSE,
  DRAWER_SELECTION,
} from '../actions/types';

const defaultState = {
  defaultOpen: false,
  expanded: true,
  selected: '',
};

function drawerReducer(state = defaultState, action) {
  switch (action.type) {
    case DRAWER_EXPAND:
      return {
        ...state,
        expanded: true,
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

    default:
      return state;
  }
}

export default drawerReducer;