// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2023 grommunio GmbH
import React from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return (
      <Component
        {...props}
        {...{ location, navigate, params }}
      />
    );
  }

  return ComponentWithRouterProp;
}
