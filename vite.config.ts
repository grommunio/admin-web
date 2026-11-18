// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import pkg from './package.json' with { type: 'json' };
import checker from 'vite-plugin-checker'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Backend for the dev server proxy
  const apiTarget = env.ADMIN_API_URL || 'http://localhost:8080';
  // REACT_APP_BUILD_VERSION: old name
  const buildVersion = env.VITE_BUILD_VERSION || env.REACT_APP_BUILD_VERSION || pkg.version;

  return {
    // Relative URLs, see <base> in index.html
    base: './',
    plugins: [react(), checker({ typescript: true })],
    resolve: {
      alias: [
        { find: /^@\//, replacement: fileURLToPath(new URL('./src/', import.meta.url)) },
        // ESM build, shared with the ESM locales
        { find: /^moment$/, replacement: 'moment/dist/moment.js' },
      ],
    },
    optimizeDeps: {
      // Pre-bundling would duplicate the instance the locales use
      exclude: ['moment'],
    },
    define: {
      'import.meta.env.VITE_BUILD_VERSION': JSON.stringify(buildVersion),
    },
    build: {
      // Layout expected by packaging and nginx
      outDir: 'build',
      assetsDir: 'static',
      license: { fileName: 'third-party-licenses.md' },
    },
    server: {
      // HOST/PORT are often set for other purposes
      host: env.DEV_HOST || '127.0.0.1',
      port: Number(env.DEV_PORT) || 3000,
      strictPort: true,
      proxy: {
        '/api/v1': { target: apiTarget, changeOrigin: true, ws: true },
        '/config.json': { target: apiTarget, changeOrigin: true },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        '/api/v1': { target: apiTarget, changeOrigin: true },
        '/config.json': { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
