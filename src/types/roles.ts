import { PartialWithRequired } from "./common";
import { BaseUser } from "./users";

type Permission =
  "SystemAdmin" |
  "ResetPasswd" |
  "DomainAdminRO" |
  "DomainAdmin" |
  "SystemAdminRO" |
  "OrgAdmin" |
  "DomainPurge";


type RolePermission = {
  ID: number;
  params: number;
  permissions: Permission;
}

export type BaseRole = {
  ID: number;
  name: string;
}

export type Role = BaseRole & {
  description: string;
  permissions: RolePermission[];
  users: BaseUser[];
}

export type DomainListItem = Omit<Role, 'domains'>;
export type NewOrg = Omit<Role, 'ID'>;
export type UpdateOrg = PartialWithRequired<Role, "ID">;
