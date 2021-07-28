// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH
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
