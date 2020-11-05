import React from "react";
import PropTypes from 'prop-types';

import { Switch } from "react-router-dom";

import AuthenticatedRoute from './components/AuthenticatedRoute';
import AuthenticatedDomainRoute from './components/AuthenticatedDomainRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';
import DefaultRedirect from "./components/DefaultRedirect";
import Loadable from 'react-loadable';
import Loader from './components/LoadingMainView';

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
const AsyncDataAreaSetup = makeLoadableComponent(() => import("./containers/DataAreas"));
const AsyncDomainList = makeLoadableComponent(() => import("./containers/Domains"));
const AsyncDomainListDetails = makeLoadableComponent(() => import("./containers/DomainDetails"));
const AsyncGroups = makeLoadableComponent(() => import("./containers/Groups"));
const AsyncGroupDetails = makeLoadableComponent(() => import("./containers/GroupDetails"));
const AsyncOrgs = makeLoadableComponent(() => import("./containers/Orgs"));
const AsyncOrgDetails = makeLoadableComponent(() => import("./containers/OrgDetails"));
const AsyncAliases = makeLoadableComponent(() => import("./containers/Aliases"));
const AsyncAliasDetails = makeLoadableComponent(() => import("./containers/AliasDetails"));
const AsyncForwards = makeLoadableComponent(() => import("./containers/Forwards"));
const AsyncForwardDetails = makeLoadableComponent(() => import("./containers/ForwardDetails"));
const AsyncMlists = makeLoadableComponent(() => import("./containers/Mlists"));
const AsyncMlistDetails = makeLoadableComponent(() => import("./containers/MlistDetails"));
const AsyncClasses = makeLoadableComponent(() => import("./containers/Classes"));
const AsyncClassDetails = makeLoadableComponent(() => import("./containers/ClassDetails"));
const AsyncMembers = makeLoadableComponent(() => import("./containers/Members"));
const AsyncMemberDetails = makeLoadableComponent(() => import("./containers/MemberDetails"));
const AsyncBaseSetup = makeLoadableComponent(() => import("./containers/BaseSetup"));
const AsyncChangePw = makeLoadableComponent(() => import("./containers/ChangePw"));
const AsyncSettings = makeLoadableComponent(() => import("./containers/Settings"));
const AsyncUsers = makeLoadableComponent(() => import("./containers/Users"));
const AsyncUserDetails = makeLoadableComponent(() => import("./containers/UserDetails"));
const AsyncUserAliases = makeLoadableComponent(() => import("./containers/UserAliases"));
const AsyncFolders = makeLoadableComponent(() => import("./containers/Folders"));
const AsyncFolderDetails = makeLoadableComponent(() => import("./containers/FolderDetails"));
const AsyncConfig = makeLoadableComponent(() => import("./containers/Config"));
const AsyncMailAddresses = makeLoadableComponent(() => import("./containers/MailAddresses"));
const AsyncMailAddressDetails = makeLoadableComponent(() => import("./containers/MailAddressDetails"));
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
      path="/domainList/:domainID*"
      exact
      component={AsyncDomainListDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/baseSetup"
      exact
      component={AsyncBaseSetup}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/changePassword"
      exact
      component={AsyncChangePw}
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
    <AuthenticatedRoute
      path="/orgs"
      exact
      component={AsyncOrgs}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/orgs/:orgID"
      exact
      component={AsyncOrgDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/aliases"
      exact
      component={AsyncAliases}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/aliases/:aliasID"
      exact
      component={AsyncAliasDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/forwards"
      exact
      component={AsyncForwards}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/forwards/:forwardsID"
      exact
      component={AsyncForwardDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/mailLists"
      exact
      component={AsyncMlists}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/mailLists/:mlistID"
      exact
      component={AsyncMlistDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/classes"
      exact
      component={AsyncClasses}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/classes/:classID"
      exact
      component={AsyncClassDetails}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/members"
      exact
      component={AsyncMembers}
      props={childProps}
    />
    <AuthenticatedRoute
      path="/members/:memberID"
      exact
      component={AsyncMemberDetails}
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
    <DefaultRedirect />
  </Switch>
);

Routes.propTypes = {
  childProps: PropTypes.object,
  domains: PropTypes.array.isRequired,
};

export default Routes;
