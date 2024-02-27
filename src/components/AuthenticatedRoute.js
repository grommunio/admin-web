// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH
/* eslint-disable react/prop-types */
import React from "react";
import {Navigate, useLocation } from "react-router-dom";

/**
 * react-router <Route> which can only be accessed if authenticated,
 * otherwise redirected to /login
 * 
 * @param {Object} props
 */
const AuthenticatedRoute = ({ component: C, props: childProps, ...rest }) => {
  const location = useLocation();
  if(!childProps.authenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}${location
      .search}${location.hash}`}/>
  }

  return <C  {...rest} {...childProps} />
};

export default AuthenticatedRoute;
