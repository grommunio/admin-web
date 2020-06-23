import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';

import thunkMiddleware from 'redux-thunk';

import authReducer from './reducers/auth';
import domainsReducer from './reducers/domains';
import drawerReducer from './reducers/drawer';

const loggerMiddleware = createLogger();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  combineReducers({
    auth: authReducer,
    domains: domainsReducer,
    drawer: drawerReducer,
  }),
  composeEnhancers(applyMiddleware(
    thunkMiddleware,

    loggerMiddleware // Must be last.
  ))
);

export default store;
