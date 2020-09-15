import React from "react";
import PropTypes from 'prop-types';

import { Switch } from "react-router-dom";

import AuthenticatedRoute from './components/AuthenticatedRoute';
import AuthenticatedDomainRoute from './components/AuthenticatedDomainRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';
import AsyncComponent from './components/AsyncComponent';
import DefaultRedirect from "./components/DefaultRedirect";

const AsyncLogin = AsyncComponent(() => import("./containers/Login"));
const AsyncMenu = AsyncComponent(() => import("./containers/Dashboard"));
const AsyncDataAreaSetup = AsyncComponent(() => import("./containers/DataAreas"));
const AsyncDomainList = AsyncComponent(() => import("./containers/Domains"));
const AsyncDomainListDetails = AsyncComponent(() => import("./containers/DomainDetails"));
const AsyncGroups = AsyncComponent(() => import("./containers/Groups"));
const AsyncGroupDetails = AsyncComponent(() => import("./containers/GroupDetails"));
const AsyncOrgs = AsyncComponent(() => import("./containers/Orgs"));
const AsyncOrgDetails = AsyncComponent(() => import("./containers/OrgDetails"));
const AsyncAliases = AsyncComponent(() => import("./containers/Aliases"));
const AsyncAliasDetails = AsyncComponent(() => import("./containers/AliasDetails"));
const AsyncForwards = AsyncComponent(() => import("./containers/Forwards"));
const AsyncForwardDetails = AsyncComponent(() => import("./containers/ForwardDetails"));
const AsyncMlists = AsyncComponent(() => import("./containers/Mlists"));
const AsyncMlistDetails = AsyncComponent(() => import("./containers/MlistDetails"));
const AsyncClasses = AsyncComponent(() => import("./containers/Classes"));
const AsyncClassDetails = AsyncComponent(() => import("./containers/ClassDetails"));
const AsyncMembers = AsyncComponent(() => import("./containers/Members"));
const AsyncMemberDetails = AsyncComponent(() => import("./containers/MemberDetails"));
const AsyncBaseSetup = AsyncComponent(() => import("./containers/BaseSetup"));
const AsyncChangePw = AsyncComponent(() => import("./containers/ChangePw"));
const AsyncSettings = AsyncComponent(() => import("./containers/Settings"));
const AsyncUsers = AsyncComponent(() => import("./containers/Users"));
const AsyncUserDetails = AsyncComponent(() => import("./containers/UserDetails"));
const AsyncFolders = AsyncComponent(() => import("./containers/Folders"));
const AsyncFolderDetails = AsyncComponent(() => import("./containers/FolderDetails"));
const AsyncConfig = AsyncComponent(() => import("./containers/Config"));
const AsyncMailAddresses = AsyncComponent(() => import("./containers/MailAddresses"));
const AsyncMailAddressDetails = AsyncComponent(() => import("./containers/MailAddressDetails"));
const AsyncDomainMenu = AsyncComponent(() => import("./containers/DomainMenu"));

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
        path={`/${domain.domainname}/users/:userID*`}
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
    <DefaultRedirect />
  </Switch>
);

Routes.propTypes = {
  childProps: PropTypes.object,
  domains: PropTypes.array.isRequired,
};

export default Routes;
