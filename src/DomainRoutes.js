import React from "react";
import PropTypes from 'prop-types';

import { Switch } from "react-router-dom";

import AuthenticatedDomainRoute from './components/AuthenticatedDomainRoute';
import AsyncComponent from './components/AsyncComponent';
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";

const AsyncDomainMenu = AsyncComponent(() => import("./containers/DomainMenu"));
const AsyncUsers = AsyncComponent(() => import("./containers/Users"));
const AsyncUserDetails = AsyncComponent(() => import("./containers/UserDetails"));
const AsyncFolders = AsyncComponent(() => import("./containers/Folders"));
const AsyncFolderDetails = AsyncComponent(() => import("./containers/FolderDetails"));
const AsyncLogin = AsyncComponent(() => import("./containers/Login"));
const AsyncMenu = AsyncComponent(() => import("./containers/Menu"));
const AsyncConfig = AsyncComponent(() => import("./containers/Config"));
const AsyncMailAddresses = AsyncComponent(() => import("./containers/MailAddresses"));
const AsyncMailAddressDetails = AsyncComponent(() => import("./containers/MailAddressDetails"));

const Routes = ({ childProps, domains }) => (
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
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.name}`}
        exact
        component={AsyncDomainMenu}
        domainName={domain.name}
        props={childProps}
        key={domain.name}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.name}/mailAddresses`}
        exact
        component={AsyncMailAddresses}
        props={childProps}
        domainName={domain.name}
        key={domain.name}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.name}/mailAddresses/:mailID`}
        exact
        component={AsyncMailAddressDetails}
        props={childProps}
        domainName={domain.name}
        key={domain.name}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.name}/users`}
        exact
        component={AsyncUsers}
        props={childProps}
        domainName={domain.name}
        key={domain.name}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.name}/users/:userID`}
        exact
        component={AsyncUserDetails}
        props={childProps}
        domainName={domain.name}
        key={domain.name}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.name}/folders`}
        exact
        component={AsyncFolders}
        props={childProps}
        domainName={domain.name}
        key={domain.name}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.name}/folders/:folderID`}
        exact
        component={AsyncFolderDetails}
        props={childProps}
        key={domain.name}
        domainName={domain.name}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.name}/configuration`}
        exact
        component={AsyncConfig}
        props={childProps}
        key={domain.name}
        domainName={domain.name}
      />
    )}
  </Switch>
);

Routes.propTypes = {
  childProps: PropTypes.object,
  domains: PropTypes.array.isRequired,
};

export default Routes;
