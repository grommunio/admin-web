import { PartialWithRequired } from "./common";
import { BaseDomain } from "./domains"

export type Org = {
  ID: number,
  description: string,
  domainCount: number,
  domains: BaseDomain[],
  name: string,
}

export type OrgListItem = Omit<Org, 'domains'>
export type NewOrg = Omit<Org, 'ID'>;
export type UpdateOrg = PartialWithRequired<Org, "ID">;
