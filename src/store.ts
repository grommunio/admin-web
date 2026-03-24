// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { combineReducers } from 'redux';

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
import globalUsersReducer from './reducers/globalUsers';
import groupsReducer from './reducers/groups';
import orgsReducer from './reducers/orgs';
import profileReducer from './reducers/profile';
import rolesReducer from './reducers/roles';
import serversReducer from './reducers/servers';
import servicesReducer from './reducers/services';
import settingsReducer from './reducers/settings';
import spamReducer from './reducers/spam';
import statusReducer from './reducers/status';
import syncReducer from './reducers/sync';
import taskqReducer from './reducers/taskq';
import usersReducer from './reducers/users';
import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useStore } from 'react-redux';


// Create redux store
export const store = configureStore({
  reducer: combineReducers({
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
    globalUsers: globalUsersReducer,
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
    spam: spamReducer,
    status: statusReducer,
    sync: syncReducer,
    taskq: taskqReducer,
    users: usersReducer,
  }),
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware();
    if (process.env.NODE_ENV === 'development') {
      defaultMiddleware.push(logger);
    }
    return defaultMiddleware;
  }
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();


export default store;
