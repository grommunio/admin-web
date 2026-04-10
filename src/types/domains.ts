import { PartialWithRequired } from "./common";
import { SyncPolicy } from "./sync";

export enum DOMAIN_STATUS {
  ACTIVATED = 0,
  DEACTIVATED = 3,
}

export type BaseDomain = {
  ID: number;
  displayname: string;
  domainname: string;
}

export type Domain = BaseDomain & {
  name: string;
  activeUsers: number;
  adminName: string;
  address: string;
  chat: boolean;
  domainStatus: DOMAIN_STATUS;
  homeserver: number | null;
  inactiveUsers: number;
  maxUser: number | null;
  orgID: number | null;
  syncPolicy: Partial<SyncPolicy>;
  tel: string;
  title: string;
  virtualUsers: number
};

export type DomainListItem = Omit<Domain, 'homeserver' | 'syncPolicy'>
export type NewDomain = Pick<Domain,
  'domainname' |
  'domainStatus' |
  'maxUser' |
  'title' |
  'address' |
  'adminName' |
  'tel' |
  'chat' |
  'homeserver' |
  'orgID'|
  'maxUser'
>
export type UpdateDomain = PartialWithRequired<Domain, "ID">;

export type DeleteDomainProps = {
  purge: boolean;
  deleteFiles: boolean;
}

export type CreateDomainParams = {
  createRole?: boolean;
}