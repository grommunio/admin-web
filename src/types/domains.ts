import { PartialWithRequired } from "./common";


export type Domain = {
  ID: number;
  name: string;
  activeUsers: number;
  address: "",
  chat: boolean,
  displayname: string,
  domainStatus: number,
  domainname: string,
  homeserver?: number,
  inactiveUsers: number,
  maxUsers: number,
  orgID: number,
  syncPolicy: any, // TODO: Create sync policy type
  tel: string,
  title: string,
  virtualUsers: number
};

export type DomainListItem = Omit<Domain, 'homeserver' | 'syncPolicy'>
export type NewDomain = Omit<Domain, 'ID'>;
export type UpdateDomain = PartialWithRequired<Domain, "ID">;
