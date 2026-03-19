type LdapConnection = {
  bindPass: string;
  bindUser: string;
  server: string;
  starttls: boolean;
};

type LdapGroupsConfig = {
  groupMemberAttr: string;
  groupaddr: string;
  groupfilter: string;
  groupname: string;
};

type LdapUsersConfig = {
  aliases: string;
  attributes: {
    kopanoQuotaHard: string;
  };
  contactFilter: string;
  contactname: string;
  displayName: string;
  filter: string;
  searchAttributes: string[];
  templates: string[];
  username: string;
};

export type LdapConfigData = {
  baseDn: string;
  connection: LdapConnection;
  disabled: boolean;
  enableContacts: boolean;
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
}

export type ImportLdapParams = {
  ID: number,
  force: boolean,
  domain: number,
}

export type SyncLdapParams = {
  import: boolean
}