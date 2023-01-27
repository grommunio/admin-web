// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH
/* eslint-disable react/prop-types */
import React from "react";

import { Route, Redirect } from "react-router-dom";

const AuthenticatedRoute = ({ component: DomainRoute, props: childProps, domain, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      childProps.authenticated
        ? <DomainRoute domain={domain} {...props} {...childProps} />
        : <Redirect
          to={`/login?redirect=${props.location.pathname}${props.location
            .search}${props.location.hash}`}
        />}
  />
);

export default AuthenticatedRoute;
