import {
  LICENSE_DATA_RECEIVED,
} from '../actions/types';


const defaultState = {
  License: {},
};

function licenseReducer(state = defaultState, action) {
  switch (action.type) {
    case LICENSE_DATA_RECEIVED:
      return {
        ...state,
        License: action.data,
      };

    default:
      return state;
  }
}

export default licenseReducer;