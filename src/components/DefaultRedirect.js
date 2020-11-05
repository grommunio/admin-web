/* eslint-disable react/prop-types */
import React from "react";

import { Route, Redirect } from "react-router-dom";

const DefaultRedirect = () => (
  <Route
    path="*"
    render={() => <Redirect
      to={`/login?redirect=${window.location.pathname}`}
    />}
  />
);

export default DefaultRedirect;
