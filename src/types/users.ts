import { PartialWithRequired } from "./common";
import { BaseRole } from "./roles";

export type BaseUser = {
  ID: number;
  username: string;
}

export type UserProperties = {
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
}

export type Altname = {
  altname: string;
  magic: number;
}

export type Forward = {
  destination: string;
  forwardType: number;
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
  properties: UserProperties;
  publicAddress: boolean;
  roles: BaseRole[];
  smtp: boolean;
  status: number;
  syncPolicy: Record<string, unknown>; // TODO: Create sync policy type
};

export type NewUser = Pick<User,
  'chat' |
  'homeserver' |
  'lang' |
  'privChat' |
  'properties' |
  'status' |
  'username'
> & { password: string };

export type UpdateUser = PartialWithRequired<User, "ID">;

export type DeleteUserParams = {
  deleteFiles: boolean;
  deleteChatUser: boolean;
}

export type DeleteOrphanedUsersType = {
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
