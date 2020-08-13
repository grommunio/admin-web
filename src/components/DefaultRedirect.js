/* eslint-disable react/prop-types */
import React from "react";

import { Route, Redirect } from "react-router-dom";

const DefaultRedirect = () => (
  <Route
    render={() => <Redirect
      to={`/`}
    />}
  />
);

export default DefaultRedirect;
