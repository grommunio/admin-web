// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH
/* eslint-disable react/prop-types */
import React from "react";
import { Route, Redirect } from "react-router-dom";

/**
 * Default route, which the user is redirected to, if the url does not match any specified route
 * 
 * @param {Object} props
 */
const DefaultRedirect = () => (
  <Route
    path="*"
    render={() => <Redirect
      to={`/login?redirect=${window.location.pathname}${window.location.hash}`}
    />}
  />
);

export default DefaultRedirect;
