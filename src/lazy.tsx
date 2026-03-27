// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { Suspense, lazy } from "react";
import React from 'react';
import Loading from "./components/Loading";

/**
 * Creates an async component from an async import
 */

export default function makeLoadableComponent(loader: () => Promise<{ default: React.ComponentType }>) {
  const AsyncComponent = lazy(loader);
  const LoadableComponent = (props={}) => (
    <Suspense fallback={<Loading />}>
      <AsyncComponent {...props}/>
    </Suspense>
  );
  return LoadableComponent;
}
