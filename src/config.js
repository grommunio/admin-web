// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import { addMiddleware } from 'redux-dynamic-middlewares';
import { createLogger } from 'redux-logger';
import { SERVER_CONFIG_SET } from './actions/types';
import store from './store';

const setConfig = (newConfig) => {
  store.dispatch({ type: SERVER_CONFIG_SET, data: newConfig });
};

// Fetch config.js on server and merge with default config
fetch('//' + window.location.host + '/config.json')
  .then(response => response.json())
  .catch(err => console.error(err))
  .then(res => {
    if (res) {
      setConfig({ ...res });
      // Enable redux logger if devMode is true
      if(res.devMode) {
        addMiddleware(createLogger());
      }
    }
  });
