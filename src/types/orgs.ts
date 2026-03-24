import { PartialWithRequired } from "./common";

export type Org = {
  ID: number,
  description: string,
  domainCount: number,
  domains: number[],
  name: string,
}

export type OrgListItem = Omit<Org, 'domains'>
export type NewOrg = Omit<Org, 'ID' | 'domainCount'>;
export type UpdateOrg = PartialWithRequired<Org, "ID">;
