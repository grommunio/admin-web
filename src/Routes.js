// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React from "react";
import PropTypes from 'prop-types';

import { Routes, Route } from "react-router-dom";

import AuthenticatedRoute from './components/AuthenticatedRoute';
import AuthenticatedDomainRoute from './components/AuthenticatedDomainRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';
import NotFound from "./containers/NotFound";
import Loadable from 'react-loadable';
import Loader from './components/Loading';
import DefaultRedirect from "./components/DefaultRedirect";
import { DOMAIN_ADMIN_READ, ORG_ADMIN, SYSTEM_ADMIN_READ } from "./constants";

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
const AsyncGlobalContactsList = makeLoadableComponent(() => import("./containers/GlobalContacts"));
const AsyncOrgs = makeLoadableComponent(() => import("./containers/Orgs"));
const AsyncOrgDetails = makeLoadableComponent(() => import("./containers/OrgDetails"));
const AsyncGroups = makeLoadableComponent(() => import("./containers/Groups"));
const AsyncGroupDetails = makeLoadableComponent(() => import("./containers/GroupDetails"));
const AsyncChangePw = makeLoadableComponent(() => import("./containers/ChangePw"));
const AsyncSettings = makeLoadableComponent(() => import("./containers/Settings"));
const AsyncUsers = makeLoadableComponent(() => import("./containers/Users"));
const AsyncUserDetails = makeLoadableComponent(() => import("./containers/UserDetails"));
const AsyncContacts = makeLoadableComponent(() => import("./containers/Contacts"));
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
const AsyncResetPasswd = makeLoadableComponent(() => import("./containers/ResetPasswd"));


/**
 * react-router routes
 * 
 * @param {Object} props
 */
const AppRoutes = ({ childProps, domains, capabilities }) => (
  <Routes>
    <Route
      path="/"
      element={<AuthenticatedRoute
        component={capabilities.includes(SYSTEM_ADMIN_READ) ? AsyncMenu : 
          capabilities.includes(DOMAIN_ADMIN_READ) ? AsyncDomainAdminMenu : AsyncResetPasswd}
        props={childProps}
      />}
    />
    <Route
      path="/login"
      element={<UnauthenticatedRoute
        component={AsyncLogin}
        props={childProps}
      />}
    />
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/domains"
      element={<AuthenticatedRoute
        component={AsyncDomainList}
        props={childProps}
      />}
    />}
    {capabilities.includes(ORG_ADMIN) && <Route
      path="/domains/:domainID"
      element={<AuthenticatedRoute
        component={AsyncDomainListDetails}
        props={childProps}
      />}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/users"
      element={<AuthenticatedRoute
        exact
        component={AsyncGlobalUsersList}
        props={childProps}
      />}
    />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/contacts"
      element={<AuthenticatedRoute
        component={AsyncGlobalContactsList}
        props={childProps}
      />}/>}
    <Route
      path="/changePassword"
      element={<AuthenticatedRoute
        component={AsyncChangePw}
        props={childProps}
      />} />
    <Route
      path="/settings"
      element={<AuthenticatedRoute
        component={AsyncSettings}
        props={childProps}
      />} />
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/roles"
      element={<AuthenticatedRoute
        component={AsyncRoles}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/defaults"
      element={<AuthenticatedRoute
        component={AsyncDefaults}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/directory"
      element={<AuthenticatedRoute
        component={AsyncLdapConfig}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/logs"
      element={<AuthenticatedRoute
        component={AsyncLogs}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/mailq"
      element={<AuthenticatedRoute
        component={AsyncMailQ}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/sync"
      element={<AuthenticatedRoute
        component={AsyncSync}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/license"
      element={<AuthenticatedRoute
        component={AsyncLicense}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/status"
      element={<AuthenticatedRoute
        component={AsyncStatus}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/dbconf"
      element={<AuthenticatedRoute
        component={AsyncDBConf}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/dbconf/:serviceName"
      element={<AuthenticatedRoute
        component={AsyncDBService}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/dbconf/:serviceName/:fileName"
      element={<AuthenticatedRoute
        component={AsyncDBFile}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/roles/:roleID"
      element={<AuthenticatedRoute
        component={AsyncRoleDetails}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/orgs"
      element={<AuthenticatedRoute
        component={AsyncOrgs}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/orgs/:orgID"
      element={<AuthenticatedRoute
        component={AsyncOrgDetails}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/servers"
      element={<AuthenticatedRoute
        component={AsyncServers}
        props={childProps}
      />} />}
    {capabilities.includes(SYSTEM_ADMIN_READ) && <Route
      path="/servers/:serverID"
      element={<AuthenticatedRoute
        component={AsyncServerDetails}
        props={childProps}
      />} />}
    <Route
      path="/taskq"
      element={<AuthenticatedRoute
        component={AsyncTaskQ}
        props={childProps}
      />} />
    <Route
      path="/taskq/:taskID"
      element={<AuthenticatedRoute
        component={AsyncTaskDetails}
        props={childProps}
      />} />
    {domains.reduce((prev, domain) => {
      prev.push(<Route
        path={`/${domain.ID}`}
        key={domain.ID}
        element={<AuthenticatedDomainRoute
          component={AsyncDomainMenu}
          domain={domain}
          props={childProps}
        />} />, <Route
        path={`/${domain.ID}/users`}
        key={domain.ID}
        element={<AuthenticatedDomainRoute
          component={AsyncUsers}
          props={childProps}
          domain={domain}
        />} />, <Route
        path={`/${domain.ID}/users/:userID`}
        key={domain.ID}
        element={<AuthenticatedDomainRoute
          component={AsyncUserDetails}
          props={childProps}
          domain={domain}
        />} />, <Route
        path={`/${domain.ID}/contacts`}
        key={domain.ID}
        element={<AuthenticatedDomainRoute
          component={AsyncContacts}
          props={childProps}
          domain={domain}
        />} />, <Route
        path={`/${domain.ID}/contacts/:userID`}
        key={domain.ID}
        element={<AuthenticatedDomainRoute
          component={AsyncContactDetails}
          props={childProps}
          domain={domain}
        />} />, <Route
        path={`/${domain.ID}/folders`}
        key={domain.ID}
        element={<AuthenticatedDomainRoute
          component={AsyncFolders}
          props={childProps}
          domain={domain}
        />} />, <Route
        path={`/${domain.ID}/folders/:folderID`}
        key={domain.ID}
        element={<AuthenticatedDomainRoute
          domain={domain}
          component={AsyncFolderDetails}
          props={childProps}
        />} />, <Route
        path={`/${domain.ID}/ldap`}
        key={domain.ID}
        element={<AuthenticatedDomainRoute
          component={AsyncLdap}
          props={childProps}
          domain={domain}
        />} />, <Route
        path={`/${domain.ID}/groups`}
        key={domain.ID}
        element={<AuthenticatedDomainRoute
          component={AsyncGroups}
          props={childProps}
          domain={domain}
        />} />, <Route
        path={`/${domain.ID}/groups/:groupID`}
        key={domain.ID}
        element={<AuthenticatedDomainRoute
          component={AsyncGroupDetails}
          props={childProps}
          domain={domain}
        />} />);
      return prev;
    }, [])}
    {!childProps.loading ?
      <Route
        path="*"
        element={<NotFound {...childProps} />} />
      : <Route path="*" element={<DefaultRedirect />} />
    }
  </Routes>
);

AppRoutes.propTypes = {
  childProps: PropTypes.object,
  domains: PropTypes.array.isRequired,
  capabilities: PropTypes.array.isRequired,
};

export default AppRoutes;
