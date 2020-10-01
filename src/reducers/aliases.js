import {
  ALIASES_DATA_ERROR,
  ALIASES_DATA_FETCH,
  ALIASES_DATA_RECEIVED,
  ALIAS_DATA_ADD,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Aliases: {},
};

function addItem(obj, data) {
  const objCopy = { ...obj };
  if(objCopy[data.mainname])objCopy[data.mainname].push({ ID: data.ID, aliasname: data.aliasname });
  else objCopy[data.mainname] = [{ ID: data.ID, aliasname: data.aliasname }];
  return objCopy;
}

function aliasesReducer(state = defaultState, action) {
  switch (action.type) {
    case ALIASES_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case ALIASES_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Aliases: action.data.data,
      };
    
    case ALIASES_DATA_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };

    case ALIAS_DATA_ADD:
      return {
        ...state,
        Aliases: addItem(state.Aliases, action.data), 
      };

    default:
      return state;
  }
}

export default aliasesReducer;
