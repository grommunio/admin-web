import React from "react";
import PropTypes from 'prop-types';

import { Switch } from "react-router-dom";

import AuthenticatedRoute from './components/AuthenticatedRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';
import AsyncComponent from './components/AsyncComponent';

const AsyncLogin = AsyncComponent(() => import("./containers/Login"));
const AsyncMenu = AsyncComponent(() => import("./containers/Menu"));
const AsyncDataAreaSetup = AsyncComponent(() => import("./containers/DataAreaSetup"));
const AsyncDomainList = AsyncComponent(() => import("./containers/DomainList"));
const AsyncDomainListDetails = AsyncComponent(() => import("./containers/DomainListDetails"));
const AsyncUsers = AsyncComponent(() => import("./containers/Users"));
const AsyncUserDetails = AsyncComponent(() => import("./containers/UserDetails"));
const AsyncGroups = AsyncComponent(() => import("./containers/Groups"));
const AsyncGroupDetails = AsyncComponent(() => import("./containers/GroupDetails"));

const Routes = ({ childProps }) => (
  <Switch>
    <AuthenticatedRoute
      path="/"
      exact
      component={AsyncMenu}
      props={childProps}
    />
    <UnauthenticatedRoute
      path="/login"
      exact
      component={AsyncLogin}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/dataAreaSetup"
      exact
      component={AsyncDataAreaSetup}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/domainList"
      exact
      component={AsyncDomainList}
      props={childProps}
    />
    <AuthenticatedRoute
      path={[
        "/domainList/:domainID",
        "/domainList/add",
      ]}
      exact
      component={AsyncDomainListDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/users"
      exact
      component={AsyncUsers}
      props={childProps}
    />
    <AuthenticatedRoute
      path={[
        "/users/:userID",
        "/users/add",
      ]}
      exact
      component={AsyncUserDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/groups"
      exact
      component={AsyncGroups}
      props={childProps}
    />
    <AuthenticatedRoute
      path={[
        "/groups/:groupID",
        "/groups/add",
      ]}
      exact
      component={AsyncGroupDetails}
      props={childProps}
    />
  </Switch>
);

Routes.propTypes = {
  childProps: PropTypes.object,
};

export default Routes;
