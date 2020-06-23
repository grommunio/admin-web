import React from "react";

import { Route } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const AppliedRoute = ({ component: C, props: cProps, ...rest }) => (
  <Route {...rest} render={props => <C {...props} {...cProps} />} />
);

export default AppliedRoute;
