import { PartialWithRequired } from "./common"

export type FolderOwner = {
  username: string;
  permissions: number;
}

export type NewFolderOwner = Omit<FolderOwner, 'permissions'>;

export type Folder = {
  folderid: string,
  name: string,
  owners: FolderOwner[],
  children: Folder[],
  parentID: string,
  displayname: string,
  container: string, // TODO: Make enum
  comment: string,
  syncMobile: boolean,
  creationtime?: string | null;
}

export type NewFolder = Pick<Folder,
  'comment' |
  'container' |
  'displayname' |
  'parentID' |
  'owners'
>

export type UpdateFolder = PartialWithRequired<Folder, 'folderid'>;
