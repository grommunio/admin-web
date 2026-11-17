// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { Provider } from 'react-redux';
import { BrowserRouter } from "react-router";
import { StyledEngineProvider } from '@mui/material/styles';
import './index.css';
import './switch.css';
import { store } from './store';
import './i18n';
import './config';
import ToggleColorMode from './components/ToggleColorMode';
import ReactDOM from "react-dom/client";
import makeLoadableComponent from './lazy';


// Chunks of the previous version are gone after an update
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem('chunkReloadAt') || 0);
    if (Date.now() - last < 10000) return;
    sessionStorage.setItem('chunkReloadAt', String(Date.now()));
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

// Async loading support.
const LoadableApp = makeLoadableComponent(() => import('./App'));

// Derive the router basename from the document's <base href>, so the app
// works correctly no matter which subpath it is deployed under.
// Falls back to "/" if no <base> tag is present.
const basePathname = new URL(document.baseURI).pathname;
const basename = basePathname.endsWith('/') ? basePathname.slice(0, -1) : basePathname;

const container = document.getElementById('root') || document.createElement("div");
const root = ReactDOM.createRoot(container);
root.render(<Provider store={store}>
  <StyledEngineProvider injectFirst>
    <ToggleColorMode>
      <BrowserRouter basename={basename}>
        <LoadableApp />
      </BrowserRouter>
    </ToggleColorMode>
  </StyledEngineProvider>
</Provider>);

