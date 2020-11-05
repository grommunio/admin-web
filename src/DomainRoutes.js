import React from "react";
import PropTypes from 'prop-types';

import { Switch, Route } from "react-router-dom";

import AuthenticatedDomainRoute from './components/AuthenticatedDomainRoute';
import Loadable from 'react-loadable';
import Loader from './components/LoadingMainView';
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import DefaultRedirect from "./components/DefaultRedirect";
import NotFound from "./containers/NotFound";

function makeLoadableComponent(loader) {
  return Loadable({
    loader,
    loading: Loader,
    timeout: 20000,
    delay: 300,
  });
}

const AsyncDomainMenu = makeLoadableComponent(() => import("./containers/DomainMenu"));
const AsyncUsers = makeLoadableComponent(() => import("./containers/Users"));
const AsyncUserDetails = makeLoadableComponent(() => import("./containers/UserDetails"));
const AsyncUserAliases = makeLoadableComponent(() => import("./containers/UserAliases"));
const AsyncFolders = makeLoadableComponent(() => import("./containers/Folders"));
const AsyncFolderDetails = makeLoadableComponent(() => import("./containers/FolderDetails"));
const AsyncLogin = makeLoadableComponent(() => import("./containers/Login"));
const AsyncMenu = makeLoadableComponent(() => import("./containers/Menu"));
const AsyncConfig = makeLoadableComponent(() => import("./containers/Config"));
const AsyncMailAddresses = makeLoadableComponent(() => import("./containers/MailAddresses"));
const AsyncMailAddressDetails = makeLoadableComponent(() => import("./containers/MailAddressDetails"));
const AsyncSettings = makeLoadableComponent(() => import("./containers/Settings"));

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
        path={`/${domain.ID}`}
        exact
        component={AsyncDomainMenu}
        domain={domain}
        props={childProps}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/mailAddresses`}
        exact
        component={AsyncMailAddresses}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/mailAddresses/:mailID`}
        exact
        component={AsyncMailAddressDetails}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/users`}
        exact
        component={AsyncUsers}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/users/:userID*`}
        exact
        component={AsyncUserDetails}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/userAliases`}
        exact
        component={AsyncUserAliases}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/folders`}
        exact
        component={AsyncFolders}
        props={childProps}
        domain={domain}
        key={domain.ID}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/folders/:folderID`}
        exact
        component={AsyncFolderDetails}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/configuration`}
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
    {!childProps.loading ?
      <Route
        route="*"
        render={(props) => <NotFound {...props} />} />
      : <DefaultRedirect />
    }
  </Switch>
);

Routes.propTypes = {
  childProps: PropTypes.object,
  domains: PropTypes.array.isRequired,
};

export default Routes;
