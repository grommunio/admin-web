import {
  USER_ALIASES_DATA_ERROR,
  USER_ALIASES_DATA_FETCH,
  USER_ALIASES_DATA_RECEIVED,
  USER_ALIAS_DATA_ADD,
  USER_ALIAS_DATA_DELETE,
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

function removeItem(obj, aliasID, mainname) {
  const copy = { ...obj };
  copy[mainname].splice(copy[mainname].findIndex(alias => alias.ID === aliasID), 1);
  if(copy[mainname].length === 0) delete copy[mainname];
  return copy;
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

    case USER_ALIAS_DATA_DELETE:
      return {
        ...state,
        Aliases: removeItem(state.Aliases, action.aliasID, action.mainName), 
      };

    default:
      return state;
  }
}

export default userAliasesReducer;
