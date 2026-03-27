export type LdapTemplate = 'ActiveDirectory' | 'OpenLDAP' | 'Univention' | '389ds';

type LdapConnection = {
  bindPass: string;
  bindUser: string;
  server: string;
  starttls: boolean;
};

export type LdapGroupsConfig = {
  groupMemberAttr: string;
  groupaddr: string;
  groupfilter: string;
  groupname: string;
};

type LdapUsersConfig = {
  aliases: string;
  attributes: Record<string, string>;
  contactFilter: string;
  displayName: string;
  filter: string;
  searchAttributes: string[];
  templates: string[];
  username: string;
  defaultQuota?: number;
};

export type LdapConfigData = {
  baseDn: string;
  connection: LdapConnection;
  disabled: boolean;
  groups: LdapGroupsConfig;
  objectID: string;
  users: LdapUsersConfig;
};

export type LdapConfig = {
  data: LdapConfigData;
  ldapAvailable: boolean;
};

export type FetchLdapParams = {
  query?: string,
  domain?: number,
  organization?: number,
  showAll?: boolean,
};

export type ImportLdapParams = {
  ID: string,
  force: boolean,
  domain: number,
};

export type SyncLdapParams = {
  import: boolean
};

export type LdapDumpParams = {
  ID: string,
  organization: number,
};

export type CheckLdapUsersParams = {
  domain: number
};