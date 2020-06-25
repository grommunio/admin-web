/* eslint-disable react/prop-types */
import React from "react";

import { Route, Redirect } from "react-router-dom";

const AuthenticatedRoute = ({ component: DomainRoute, props: childProps, domainName, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      childProps.authenticated
        ? <DomainRoute domain={domainName} {...props} {...childProps} />
        : <Redirect
          to={`/login?redirect=${props.location.pathname}${props.location
            .search}`}
        />}
  />
);

export default AuthenticatedRoute;
