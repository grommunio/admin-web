// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from "react";
import { Navigate } from "react-router-dom";

import { parseParams } from '../utils';

/**
 * react-router <Route> which can be accessed if not authenticated
 * 
 */

type UnauthenticatedRouteProps = {
  component: React.ComponentType<any>;
  props: any;
}

const UnauthenticatedRoute = ({ component: C, props: childProps, ...rest }: UnauthenticatedRouteProps) => {
  // Get redirect url parameter
  const query = parseParams(window.location.search.slice(1));
  const redirect = query.redirect;
  const hash = window.location.hash;

  if(childProps.authenticated) {
    return <Navigate to={!redirect ? "/" : redirect + hash}/>
  }

  return (
    <C {...childProps} {...rest}/>
  );
};


export default UnauthenticatedRoute;
