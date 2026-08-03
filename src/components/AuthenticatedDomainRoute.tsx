// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH
/* eslint-disable react/prop-types */
import { DomainViewProps } from "@/types/common";
import { Domain } from "@/types/domains";
import React from "react";

import { Navigate, useLocation } from "react-router-dom";

type AuthenticatedDomainRouteProps = {
  component: React.ComponentType<DomainViewProps>;
  props: {
    authenticated: boolean;
    loading: boolean;
  };
  domain: Domain;
}

const AuthenticatedDomainRoute = ({ component: DomainRoute, props: childProps, domain, ...rest }: AuthenticatedDomainRouteProps) => {
  const location = useLocation();
  if(!childProps.authenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}${location
      .search}${location.hash}`}/>
  }

  return <DomainRoute domain={domain} {...rest} {...childProps} />
};

export default AuthenticatedDomainRoute;
