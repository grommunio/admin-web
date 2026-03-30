import { URLParams } from "@/actions/types";
import { PartialWithRequired } from "./common";
import { SyncPolicy } from "./sync";


export type BaseUser = {
  ID: number;
  username: string;
}

export type UserProperties = {
  displayname: string;
  initials: string;
  nickname: string;
  title: string;
  companyname: string;
  locality: string;
  departmentname: string
  stateorprovince: string;
  officelocation: string;
  postalcode: string;
  assistant: string;

  smtpaddress: string;
  surname: string;
  assocmessagesizeextended: number;
  attributehidden_gromox: number;
  businesstelephonenumber: string;
  creationtime: string;
  displaytypeex: number;
  givenname: string;
  internetarticlenumber: number;
  messagesizeextended: number;
  normalmessagesizeextended: number;
  outofofficestate: number;
  scheduleinfodisallowrecurringappts: boolean;
  scheduleinfodisallowoverlappingappts: boolean;
  scheduleinfoautoacceptappointments: boolean;
  streetaddress: string;

  country: string;
  hometelephonenumber: string;
  business2telephonenumber: string;
  primarytelephonenumber: string;
  home2telephonenumber: string;
  primaryfaxnumber: string;
  mobiletelephonenumber: string;
  assistanttelephonenumber: string;
  pagertelephonenumber: string;
  comment: string;

  // This should probably be removed
  storagequotalimit: number,
  prohibitreceivequota: number,
  prohibitsendquota: number,
}

export type Altname = {
  altname: string;
  magic?: number;
}

export type Forward = {
  destination: string;
  forwardType?: number;
}

export type User = BaseUser & {
  aliases: string[];
  altnames: Altname[];
  changePassword: boolean;
  chat: boolean;
  chatAdmin: boolean;
  domainID: number;
  fetchmail: any[]; // TODO: Define fetchmail
  forward: Forward;
  homeserver: number | null;
  lang: string;
  ldapID: number | null;
  mlist: any | null; // TODO: Define mlist
  orgID: number;
  pop3_imap: boolean;
  privArchive: boolean;
  privChat: boolean;
  privDav: boolean;
  privEas: boolean;
  privFiles: boolean;
  privVideo: boolean;
  privWeb: boolean;
  properties: Partial<UserProperties>;
  publicAddress: boolean;
  roles: number[];
  smtp: boolean;
  status: number;
  syncPolicy: Partial<SyncPolicy>;
  defaultPolicy: Partial<SyncPolicy>;
};

export type UserListItem = Pick<User, 'ID' | 'domainID' | 'ldapID' | 'properties' | 'status' | 'username'>

export type NewUser = Pick<User,
  'chat' |
  'homeserver' |
  'lang' |
  'chat' |
  'properties' |
  'status' |
  'username'
> & { password: string };

export type UpdateUser = PartialWithRequired<User, "ID">;

type LdapUserType = "user" | "contact" | "group";
export type LdapUser = {
  ID: string;
  email: string;
  error: string | null;
  name: string;
  type: LdapUserType;
}

export type OrphanedUser = BaseUser & {
  status: number;
  displayname: string;
  smtpaddress?: string;
  username?: string;
}

export type ContactListItem = {
  ID: number;
  domainID: number;
  ldapID: string;
  username: string;
  status: number;
  properties: Partial<UserProperties>;
}

export type NewContact = {
  status: number;
  properties: Partial<UserProperties>;
}

export type DeleteUserParams = {
  deleteFiles: boolean;
  deleteChatUser: boolean;
}

export type DeleteOrphanedUsersParams = {
  userID?: number;
  deleteFiles: boolean;
}

export type OofSettings = {
  state: 0 | 1;
  externalAudience: 0 | 1 | 2;
  startTime: string | null;
  endTime: string | null;
  internalSubject: string;
  internalReply: string;
  externalSubject: string;
  externalReply: string;
  tab: number;
  snackbar: string;
};

export type Owner = {
  displayName: string;
  memberID: number;
  permissions: number;
  username: string;
}

type Protocol = "POP3" | "IMAP" | "POP2" | "ETRN" | "AUTO";
type AuthType = "password" | "kerberos_v5" | "kerberos" | "kerberos_v4" | "gssapi" |
    "cram-md5" | "otp" | "ntlm" | "msn" | "ssh" | "any";

export type FetchmailConfig = {
  ID: number;
  active: boolean;
  srcServer: string;
  srcUser: string;
  srcPassword: string;
  srcAuth: AuthType;
  srcFolder: string;
  fetchall: boolean;
  keep: boolean;
  protocol: Protocol;
  useSSL: boolean;
  sslCertCheck: boolean;
  sslCertPath: string;
  sslFingerprint: string;
  extraOptions: string;
};

export type NewFetchmailConfig = Omit<FetchmailConfig, "ID">;

export type FetchUserParams = {
  filterProp?: string;
  status?: number[] | number;
  orgID?: number,
} & URLParams;

