import { PartialWithRequired } from "./common";

export type Group = {
  ID: number;
  associations: string[],
  displayname: string,
  domainID: number,
  hidden: number,
  listPrivilege: number,
  listType: number,
  listname: string,
  specifieds: string[],
  user: number,
};

export type GroupListItem = Pick<
  Group,
  "ID" | "domainID" | "listPrivilege" | "listType" | "listname"
>;
export type NewGroup = Omit<Group, 'ID' | 'user'>;
export type UpdateGroup = PartialWithRequired<Group, "ID">;
