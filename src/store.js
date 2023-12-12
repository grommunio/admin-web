// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import thunkMiddleware from 'redux-thunk';
import dynamicMiddlewares from 'redux-dynamic-middlewares';

// Keep alphabetically ordered
import aboutReducer from './reducers/about';
import antispamReducer from './reducers/antispam';
import authReducer from './reducers/auth';
import configReducer from './reducers/config';
import dashboardReducer from './reducers/dashboard';
import dbconfReducer from './reducers/dbconf';
import defaultsReducer from './reducers/defaults';
import domainsReducer from './reducers/domains';
import drawerReducer from './reducers/drawer';
import foldersReducer from './reducers/folders';
import ldapReducer from './reducers/ldap';
import licenseReducer from './reducers/license';
import logsReducer from './reducers/logs';
import groupsReducer from './reducers/groups';
import orgsReducer from './reducers/orgs';
import profileReducer from './reducers/profile';
import rolesReducer from './reducers/roles';
import serversReducer from './reducers/servers';
import servicesReducer from './reducers/services';
import settingsReducer from './reducers/settings';
import statusReducer from './reducers/status';
import syncReducer from './reducers/sync';
import taskqReducer from './reducers/taskq';
import usersReducer from './reducers/users';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create redux store
export const store = createStore(
  combineReducers({
    about: aboutReducer,
    antispam: antispamReducer,
    auth: authReducer,
    config: configReducer,
    dashboard: dashboardReducer,
    dbconf: dbconfReducer,
    defaults: defaultsReducer,
    domains: domainsReducer,
    drawer: drawerReducer,
    folders: foldersReducer,
    groups: groupsReducer,
    ldap: ldapReducer,
    license: licenseReducer,
    logs: logsReducer,
    orgs: orgsReducer,
    profile: profileReducer,
    roles: rolesReducer,
    servers: serversReducer,
    services: servicesReducer,
    settings: settingsReducer,
    status: statusReducer,
    sync: syncReducer,
    taskq: taskqReducer,
    users: usersReducer,
  }),
  composeEnhancers(applyMiddleware(
    thunkMiddleware,
    dynamicMiddlewares,
  ))
);

export default store;
