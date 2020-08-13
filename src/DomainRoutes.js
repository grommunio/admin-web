import React from "react";
import PropTypes from 'prop-types';

import { Switch } from "react-router-dom";

import AuthenticatedDomainRoute from './components/AuthenticatedDomainRoute';
import AsyncComponent from './components/AsyncComponent';
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import DefaultRedirect from "./components/DefaultRedirect";

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
const AsyncSettings = AsyncComponent(() => import("./containers/Settings"));

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
        path={`/${domain.domainname}`}
        exact
        component={AsyncDomainMenu}
        domain={domain}
        props={childProps}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.domainname}/mailAddresses`}
        exact
        component={AsyncMailAddresses}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.domainname}/mailAddresses/:mailID`}
        exact
        component={AsyncMailAddressDetails}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.domainname}/users`}
        exact
        component={AsyncUsers}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.domainname}/users/:userID`}
        exact
        component={AsyncUserDetails}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.domainname}/folders`}
        exact
        component={AsyncFolders}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.domainname}/folders/:folderID`}
        exact
        component={AsyncFolderDetails}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.domainname}/configuration`}
        exact
        component={AsyncConfig}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    <AuthenticatedRoute
      path={`/settings`}
      exact
      component={AsyncSettings}
      props={childProps}
    />
    <DefaultRedirect />
  </Switch>
);

Routes.propTypes = {
  childProps: PropTypes.object,
  domains: PropTypes.array.isRequired,
};

export default Routes;
