import { BaseUser } from "./users"

export type Folder = {
  folderid: string,
  name: string,
  owners: BaseUser[],
  children: Folder[],
  parentID: number,
  displayname: string,
  container: string, // TODO: Make enum
  comment: string,
  syncMobile: boolean,
}