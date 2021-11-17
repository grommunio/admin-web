// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import React from "react";
import PropTypes from 'prop-types';

import { Switch, Route } from "react-router-dom";

import AuthenticatedRoute from './components/AuthenticatedRoute';
import AuthenticatedDomainRoute from './components/AuthenticatedDomainRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';
import NotFound from "./containers/NotFound";
import Loadable from 'react-loadable';
import Loader from './components/Loading';
import DefaultRedirect from "./components/DefaultRedirect";

function makeLoadableComponent(loader) {
  return Loadable({
    loader,
    loading: Loader,
    timeout: 20000,
    delay: 300,
  });
}

const AsyncLogin = makeLoadableComponent(() => import("./containers/Login"));
const AsyncMenu = makeLoadableComponent(() => import("./containers/Dashboard"));
const AsyncDomainList = makeLoadableComponent(() => import("./containers/Domains"));
const AsyncDomainListDetails = makeLoadableComponent(() => import("./containers/DomainDetails"));
const AsyncGlobalUsersList = makeLoadableComponent(() => import("./containers/GlobalUsers"));
const AsyncOrgs = makeLoadableComponent(() => import("./containers/Orgs"));
const AsyncOrgDetails = makeLoadableComponent(() => import("./containers/OrgDetails"));
const AsyncMlists = makeLoadableComponent(() => import("./containers/MLists"));
const AsyncMlistDetails = makeLoadableComponent(() => import("./containers/MListDetails"));
const AsyncClasses = makeLoadableComponent(() => import("./containers/Classes"));
const AsyncClassDetails = makeLoadableComponent(() => import("./containers/ClassDetails"));
const AsyncChangePw = makeLoadableComponent(() => import("./containers/ChangePw"));
const AsyncSettings = makeLoadableComponent(() => import("./containers/Settings"));
const AsyncUsers = makeLoadableComponent(() => import("./containers/Users"));
const AsyncUserDetails = makeLoadableComponent(() => import("./containers/UserDetails"));
const AsyncLdap = makeLoadableComponent(() => import("./containers/Ldap"));
const AsyncLdapConfig = makeLoadableComponent(() => import("./containers/LdapConfig"));
const AsyncFolders = makeLoadableComponent(() => import("./containers/Folders"));
const AsyncFolderDetails = makeLoadableComponent(() => import("./containers/FolderDetails"));
const AsyncDBConf = makeLoadableComponent(() => import("./containers/DBConf"));
const AsyncDBService = makeLoadableComponent(() => import("./containers/DBService"));
const AsyncDBFile = makeLoadableComponent(() => import("./containers/DBFile"));
const AsyncDomainMenu = makeLoadableComponent(() => import("./containers/DomainMenu"));
const AsyncRoles = makeLoadableComponent(() => import("./containers/Roles"));
const AsyncRoleDetails = makeLoadableComponent(() => import("./containers/RoleDetails"));
const AsyncLogs = makeLoadableComponent(() => import("./containers/Logs"));
const AsyncMailQ = makeLoadableComponent(() => import("./containers/MailQ"));
const AsyncSync = makeLoadableComponent(() => import("./containers/Sync"));
const AsyncStatus = makeLoadableComponent(() => import("./containers/Status"));
const AsyncLicense = makeLoadableComponent(() => import("./containers/License"));

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
    <AuthenticatedRoute
      path="/domains"
      exact
      component={AsyncDomainList}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/domains/:domainID*"
      exact
      component={AsyncDomainListDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/users"
      exact
      component={AsyncGlobalUsersList}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/changePassword"
      exact
      component={AsyncChangePw}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/settings"
      exact
      component={AsyncSettings}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/roles"
      exact
      component={AsyncRoles}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/directory"
      exact
      component={AsyncLdapConfig}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/logs"
      exact
      component={AsyncLogs}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/mailq"
      exact
      component={AsyncMailQ}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/sync"
      exact
      component={AsyncSync}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/license"
      exact
      component={AsyncLicense}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/status"
      exact
      component={AsyncStatus}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/dbconf"
      exact
      component={AsyncDBConf}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/dbconf/:serviceName"
      exact
      component={AsyncDBService}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/dbconf/:serviceName/:fileName"
      exact
      component={AsyncDBFile}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/roles/:roleID"
      exact
      component={AsyncRoleDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/orgs"
      exact
      component={AsyncOrgs}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/orgs/:orgID*"
      exact
      component={AsyncOrgDetails}
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
        path={`/${domain.ID}/ldap`}
        exact
        component={AsyncLdap}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/classes`}
        exact
        component={AsyncClasses}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/classes/:classID`}
        exact
        component={AsyncClassDetails}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/mailLists`}
        exact
        component={AsyncMlists}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/mailLists/:mlistID`}
        exact
        component={AsyncMlistDetails}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
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
