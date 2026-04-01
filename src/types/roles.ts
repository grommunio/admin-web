import { BaseUser } from "./users";

export type Permission = "" |
  "SystemAdmin" |
  "ResetPasswd" |
  "DomainAdminRO" |
  "DomainAdmin" |
  "SystemAdminRO" |
  "OrgAdmin" |
  "DomainPurge";

export type RolePermission = {
  ID: number;
  params: string | number;
  permission: Permission;
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

export type RoleListItem = Omit<Role, 'domains'>;
export type NewRole = {
  name: string;
  description: string;
  users: number[];
  permissions: { permission: Permission, params: string | number }[];
}
export type UpdateRole = BaseRole & {
  description: string;
  permissions: any[]; // API is terrible
  users: number[];
};
