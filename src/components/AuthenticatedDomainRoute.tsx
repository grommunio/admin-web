// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH
/* eslint-disable react/prop-types */
import { Domain } from "@/types/domains";
import React from "react";

import { Navigate } from "react-router-dom";

type AuthenticatedDomainRouteProps = {
  component: keyof React.JSX.IntrinsicElements;
  props: any;
  domain: Domain;
}

const AuthenticatedDomainRouteProps = ({ component: DomainRoute, props: childProps, domain, ...rest }: AuthenticatedDomainRouteProps) => {
  if(!childProps.authenticated) {
    return <Navigate to={`/login?redirect=${window.location.pathname}${window.location
      .search}${window.location.hash}`}/>
  }

  return <DomainRoute domain={domain} {...rest} {...childProps} />
};

export default AuthenticatedDomainRouteProps;
