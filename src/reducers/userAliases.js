import {
  USER_ALIASES_DATA_ERROR,
  USER_ALIASES_DATA_FETCH,
  USER_ALIASES_DATA_RECEIVED,
  USER_ALIAS_DATA_ADD,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Aliases: {},
};

function addItem(obj, data) {
  const objCopy = { ...obj };
  if(objCopy[data.mainname])objCopy[data.mainname].push(data.aliasname);
  else objCopy[data.mainname] = [data.aliasname];
  return objCopy;
}

function userAliasesReducer(state = defaultState, action) {
  switch (action.type) {
    case USER_ALIASES_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case USER_ALIASES_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Aliases: action.data.data,
      };
    
    case USER_ALIASES_DATA_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    
    case USER_ALIAS_DATA_ADD:
      return {
        ...state,
        Aliases: addItem(state.Aliases, action.data), 
      };

    default:
      return state;
  }
}

export default userAliasesReducer;
