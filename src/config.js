// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { SERVER_CONFIG_ERROR, SERVER_CONFIG_SET } from './actions/types';
import store from './store';

// Yeet config into redux store
const setConfig = (newConfig) => {
  store.dispatch({ type: SERVER_CONFIG_SET, data: newConfig });
};

const error = () => {
  store.dispatch({ type: SERVER_CONFIG_ERROR, error: true });
}

// Fetch config.js on server and merge with default config
fetch('//' + window.location.host + '/config.json')
  .then(async response => {
    if (response.ok) {
      try {
        const res = await response.json();
        setConfig({ ...res });
      } catch (err) {
        error();
      }
    } else {
      error();
    }
  });
