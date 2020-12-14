// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React from "react";

import { Route, Redirect } from "react-router-dom";

import { parseParams } from '../utils';

// eslint-disable-next-line react/prop-types
const UnauthenticatedRoute = ({ component: C, props: childProps, ...rest }) => {
  const query = parseParams(window.location.search.substr(1));
  const redirect = query.redirect;

  return (
    <Route
      {...rest}
      render={props =>
        !childProps.authenticated
          ? <C {...props} {...childProps} />
          : <Redirect
            to={!redirect ? "/" : redirect}
          />}
    />
  );
};

export default UnauthenticatedRoute;
