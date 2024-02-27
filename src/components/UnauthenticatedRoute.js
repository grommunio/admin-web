// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from "react";
import { PropTypes } from "prop-types";
import { Navigate } from "react-router-dom";

import { parseParams } from '../utils';

/**
 * react-router <Route> which can be accessed if not authenticated
 * 
 * @param {Object} props
 */
// eslint-disable-next-line react/prop-types
const UnauthenticatedRoute = ({ component: C, props: childProps, ...rest }) => {
  // Get redirect url parameter
  const query = parseParams(window.location.search.substr(1));
  const redirect = query.redirect;
  const hash = window.location.hash;

  if(childProps.authenticated) {
    return <Navigate to={!redirect ? "/" : redirect + hash}/>
  }

  return (
    <C {...childProps} {...rest}/>
  );
};

UnauthenticatedRoute.propTypes = {
  props: PropTypes.object,
}

export default UnauthenticatedRoute;
