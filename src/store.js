import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';

import thunkMiddleware from 'redux-thunk';

import aliasesReducer from './reducers/aliases';
import authReducer from './reducers/auth';
import classesReducer from './reducers/classes';
import domainsReducer from './reducers/domains';
import drawerReducer from './reducers/drawer';
import foldersReducer from './reducers/folders';
import forwardsReducer from './reducers/forwards';
import membersReducer from './reducers/members';
import mlistsReducer from './reducers/mlists';
import orgsReducer from './reducers/orgs';
import usersReducer from './reducers/users';
import groupsReducer from './reducers/groups';

const loggerMiddleware = createLogger();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  combineReducers({
    aliases: aliasesReducer,
    auth: authReducer,
    classes: classesReducer,
    domains: domainsReducer,
    drawer: drawerReducer,
    folders: foldersReducer,
    forwards: forwardsReducer,
    groups: groupsReducer,
    members: membersReducer,
    mlists: mlistsReducer,
    orgs: orgsReducer,
    users: usersReducer,
  }),
  composeEnhancers(applyMiddleware(
    thunkMiddleware,
    loggerMiddleware // Must be last.
  ))
);

export default store;
