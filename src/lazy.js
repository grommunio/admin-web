import { Suspense, lazy } from "react";
import React from 'react';
import Loading from "./components/Loading";

/**
 * Creates an async component from an async import
 * 
 * @param {Function} loader Callback function, that imports a container.
 */

export default function makeLoadableComponent(loader, LoaderComponent) {
  const AsyncComponent = lazy(loader);
  const LoadableComponent = (props={}) => (
    <Suspense fallback={LoaderComponent || <Loading />}>
      <AsyncComponent {...props}/>
    </Suspense>
  );
  return LoadableComponent;
}
