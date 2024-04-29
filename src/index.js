// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import { StyledEngineProvider } from '@mui/material/styles';
import './index.css';
import { store } from './store';
import './i18n';
import './config';
import ToggleColorMode from './components/ToggleColorMode';
import ReactDOM from "react-dom/client";
import makeLoadableComponent from './lazy';


// Async loading support.
const LoadableApp = makeLoadableComponent(() => import('./App'));

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<Provider store={store}>
  <StyledEngineProvider injectFirst>
    <ToggleColorMode>
      <BrowserRouter>
        <LoadableApp />
      </BrowserRouter>
    </ToggleColorMode>
  </StyledEngineProvider>
</Provider>);

