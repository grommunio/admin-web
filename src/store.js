// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import thunkMiddleware from 'redux-thunk';
import dynamicMiddlewares from 'redux-dynamic-middlewares';

// Keep alphabetically ordered
import authReducer from './reducers/auth';
import classesReducer from './reducers/classes';
import dashboardReducer from './reducers/dashboard';
import dbconfReducer from './reducers/dbconf';
import domainsReducer from './reducers/domains';
import drawerReducer from './reducers/drawer';
import foldersReducer from './reducers/folders';
//import forwardsReducer from './reducers/forwards';
import ldapReducer from './reducers/ldap';
import licenseReducer from './reducers/license';
//import membersReducer from './reducers/members';
import mlistsReducer from './reducers/mlists';
import orgsReducer from './reducers/orgs';
import usersReducer from './reducers/users';
import rolesReducer from './reducers/roles';
import profileReducer from './reducers/profile';
import servicesReducer from './reducers/services';
import settingsReducer from './reducers/settings';
import antispamReducer from './reducers/antispam';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  combineReducers({
    antispam: antispamReducer,
    auth: authReducer,
    _classes: classesReducer,
    dashboard: dashboardReducer,
    dbconf: dbconfReducer,
    domains: domainsReducer,
    drawer: drawerReducer,
    folders: foldersReducer,
    ldap: ldapReducer,
    license: licenseReducer,
    mLists: mlistsReducer,
    orgs: orgsReducer,
    profile: profileReducer,
    roles: rolesReducer,
    services: servicesReducer,
    settings: settingsReducer,
    users: usersReducer,
  }),
  composeEnhancers(applyMiddleware(
    thunkMiddleware,
    dynamicMiddlewares,
  ))
);

export default store;
