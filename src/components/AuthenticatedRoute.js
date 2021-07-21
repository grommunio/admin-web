// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH
/* eslint-disable react/prop-types */
import React from "react";

import { Route, Redirect } from "react-router-dom";

const AuthenticatedRoute = ({ component: C, props: childProps, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      childProps.authenticated
        ? <C {...props} {...childProps} />
        : <Redirect
          to={`/login?redirect=${props.location.pathname}${props.location
            .search}`}
        />}
  />
);

export default AuthenticatedRoute;
