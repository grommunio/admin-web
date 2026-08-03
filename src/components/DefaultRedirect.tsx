// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH
/* eslint-disable react/prop-types */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Default route, which the user is redirected to, if the url does not match any specified route
 */
const DefaultRedirect = () => {
  const location = useLocation();
  return <Navigate
    to={`/login?redirect=${location.pathname}${location.hash}`}
  />
};

export default DefaultRedirect;
