import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';

import thunkMiddleware from 'redux-thunk';

// Keep alphabetically ordered
import aliasesReducer from './reducers/aliases';
import areasReducer from './reducers/areas';
import authReducer from './reducers/auth';
import classesReducer from './reducers/classes';
import dashboardReducer from './reducers/dashboard';
import domainsReducer from './reducers/domains';
import drawerReducer from './reducers/drawer';
import foldersReducer from './reducers/folders';
import forwardsReducer from './reducers/forwards';
import membersReducer from './reducers/members';
import mlistsReducer from './reducers/mlists';
import orgsReducer from './reducers/orgs';
import usersReducer from './reducers/users';
import userAliasesReducer from './reducers/userAliases';
import groupsReducer from './reducers/groups';
import rolesReducer from './reducers/roles';
import servicesReducer from './reducers/services';
import settingsReducer from './reducers/settings';

const loggerMiddleware = createLogger();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  // Keep alphabetically ordered
  combineReducers({
    aliases: aliasesReducer,
    areas: areasReducer,
    auth: authReducer,
    classes: classesReducer,
    dashboard: dashboardReducer,
    domains: domainsReducer,
    drawer: drawerReducer,
    folders: foldersReducer,
    forwards: forwardsReducer,
    groups: groupsReducer,
    members: membersReducer,
    mlists: mlistsReducer,
    orgs: orgsReducer,
    roles: rolesReducer,
    services: servicesReducer,
    settings: settingsReducer,
    users: usersReducer,
    userAliases: userAliasesReducer,
  }),
  composeEnhancers(applyMiddleware(
    thunkMiddleware,
    loggerMiddleware // Must be last.
  ))
);

export default store;
