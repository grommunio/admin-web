// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

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
import { ORG_ADMIN, SYSTEM_ADMIN_READ } from "./constants";

/**
 * Creates an async component from an async import
 * 
 * @param {Function} loader Callback function, that imports a container.
 */
function makeLoadableComponent(loader) {
  return Loadable({
    loader,
    loading: Loader,
    timeout: 20000,
    delay: 300,
  });
}

// Create async components
const AsyncLogin = makeLoadableComponent(() => import("./containers/Login"));
const AsyncMenu = makeLoadableComponent(() => import("./containers/Dashboard"));
const AsyncDomainAdminMenu = makeLoadableComponent(() => import("./containers/Menu"));
const AsyncDefaults = makeLoadableComponent(() => import("./containers/Defaults"));
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
const AsyncContactDetails = makeLoadableComponent(() => import("./containers/ContactDetails"));
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
const AsyncTaskQ = makeLoadableComponent(() => import("./containers/TaskQ"));
const AsyncTaskDetails = makeLoadableComponent(() => import("./containers/TaskDetails"));
const AsyncSync = makeLoadableComponent(() => import("./containers/Sync"));
const AsyncStatus = makeLoadableComponent(() => import("./containers/Status"));
const AsyncServers = makeLoadableComponent(() => import("./containers/Servers"));
const AsyncServerDetails = makeLoadableComponent(() => import("./containers/ServerDetails"));
const AsyncLicense = makeLoadableComponent(() => import("./containers/License"));

/**
 * react-router routes
 * 
 * @param {Object} props
 */
const Routes = ({ childProps, domains, capabilities }) => (
  <Switch>
    <AuthenticatedRoute
      path="/"
      exact
      component={capabilities.includes(SYSTEM_ADMIN_READ) ? AsyncMenu : AsyncDomainAdminMenu}
      props={childProps}
    />
    <UnauthenticatedRoute
      path="/login"
      exact
      component={AsyncLogin}
      props={childProps}
    />
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/domains"
      exact
      component={AsyncDomainList}
      props={childProps}
    />}
    {capabilities.includes(ORG_ADMIN) &&<AuthenticatedRoute
      path="/domains/:domainID*"
      exact
      component={AsyncDomainListDetails}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/users"
      exact
      component={AsyncGlobalUsersList}
      props={childProps}
    />}
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
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/roles"
      exact
      component={AsyncRoles}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/defaults"
      exact
      component={AsyncDefaults}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/directory"
      exact
      component={AsyncLdapConfig}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/logs"
      exact
      component={AsyncLogs}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/mailq"
      exact
      component={AsyncMailQ}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/sync"
      exact
      component={AsyncSync}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/license"
      exact
      component={AsyncLicense}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/status"
      exact
      component={AsyncStatus}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/dbconf"
      exact
      component={AsyncDBConf}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/dbconf/:serviceName"
      exact
      component={AsyncDBService}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/dbconf/:serviceName/:fileName"
      exact
      component={AsyncDBFile}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/roles/:roleID"
      exact
      component={AsyncRoleDetails}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/orgs"
      exact
      component={AsyncOrgs}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/orgs/:orgID*"
      exact
      component={AsyncOrgDetails}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/servers"
      exact
      component={AsyncServers}
      props={childProps}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <AuthenticatedRoute
      path="/servers/:serverID*"
      exact
      component={AsyncServerDetails}
      props={childProps}
    />}
    <AuthenticatedRoute
      path="/taskq"
      exact
      component={AsyncTaskQ}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/taskq/:taskID*"
      exact
      component={AsyncTaskDetails}
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
        path={`/${domain.ID}/contacts/:userID*`}
        exact
        component={AsyncContactDetails}
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
  capabilities: PropTypes.array.isRequired,
};

export default Routes;
