import { PartialWithRequired } from "./common";


export enum LIST_PRIVILEGE {
  ALL = 0,
  INTERNAL = 1,
  DOMAIN = 2,
  SPECIFIC = 3,
  OUTGOING = 4,
}

export enum LIST_TYPE {
  NORMAL = 0,
  DOMAIN = 2,
}

export type Group = {
  ID: number;
  associations?: string[],
  displayname: string,
  domainID: number,
  hidden: number,
  listPrivilege: LIST_PRIVILEGE,
  listType: LIST_TYPE,
  listname: string,
  specifieds?: string[],
  user: number,
};

export type GroupListItem = Pick<
  Group,
  "ID" | "domainID" | "listPrivilege" | "listType" | "listname"
>;
export type NewGroup = Omit<Group, 'ID' | 'user'>;
export type UpdateGroup = PartialWithRequired<Group, "ID">;
