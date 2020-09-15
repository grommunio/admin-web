import {
  CHANGE_SETTINGS,
} from '../actions/types';

const defaultState = {
  language: 'en-US',
};

function settingsReducer(state = defaultState, action) {
  switch(action.type) {
    case CHANGE_SETTINGS:
      return {
        ...state,
        [action.field]: action.value,
      };

    default:
      break;
  }
  return state;
}

export default settingsReducer;