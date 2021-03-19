// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

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
const AsyncGroups = makeLoadableComponent(() => import("./containers/Groups"));
const AsyncGroupDetails = makeLoadableComponent(() => import("./containers/GroupDetails"));
//const AsyncOrgs = makeLoadableComponent(() => import("./containers/Orgs"));
////const AsyncOrgDetails = makeLoadableComponent(() => import("./containers/OrgDetails"));
//const AsyncForwards = makeLoadableComponent(() => import("./containers/Forwards"));
//const AsyncForwardDetails = makeLoadableComponent(() => import("./containers/ForwardDetails"));
const AsyncMlists = makeLoadableComponent(() => import("./containers/MLists"));
const AsyncMlistDetails = makeLoadableComponent(() => import("./containers/MListDetails"));
const AsyncClasses = makeLoadableComponent(() => import("./containers/Classes"));
const AsyncClassDetails = makeLoadableComponent(() => import("./containers/ClassDetails"));
//const AsyncMembers = makeLoadableComponent(() => import("./containers/Members"));
//const AsyncMemberDetails = makeLoadableComponent(() => import("./containers/MemberDetails"));
//const AsyncBaseSetup = makeLoadableComponent(() => import("./containers/BaseSetup"));
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
//const AsyncConfig = makeLoadableComponent(() => import("./containers/Config"));
//const AsyncMailAddresses = makeLoadableComponent(() => import("./containers/MailAddresses"));
//const AsyncMailAddressDetails = makeLoadableComponent(() => import("./containers/MailAddressDetails"));
const AsyncDomainMenu = makeLoadableComponent(() => import("./containers/DomainMenu"));
const AsyncRoles = makeLoadableComponent(() => import("./containers/Roles"));
const AsyncRoleDetails = makeLoadableComponent(() => import("./containers/RoleDetails"));

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
      path="/domainList"
      exact
      component={AsyncDomainList}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/domainList/:domainID*"
      exact
      component={AsyncDomainListDetails}
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
      path="/ldap"
      exact
      component={AsyncLdapConfig}
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
      path="/roles/:roleID"
      exact
      component={AsyncRoleDetails}
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
        path={`/${domain.ID}/groups`}
        exact
        component={AsyncGroups}
        props={childProps}
        key={domain.ID}
        domain={domain}
      />
    )}
    {domains.map(domain =>
      <AuthenticatedDomainRoute
        path={`/${domain.ID}/groups/:groupID`}
        exact
        component={AsyncGroupDetails}
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
