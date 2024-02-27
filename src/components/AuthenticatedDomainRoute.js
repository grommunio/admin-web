// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH
/* eslint-disable react/prop-types */
import React from "react";

import { Navigate } from "react-router-dom";

const AuthenticatedRoute = ({ component: DomainRoute, props: childProps, domain, ...rest }) => {
  if(!childProps.authenticated) {
    return <Navigate to={`/login?redirect=${window.location.pathname}${window.location
      .search}${window.location.hash}`}/>
  }

  return <DomainRoute domain={domain} {...rest} {...childProps} />
};

export default AuthenticatedRoute;
