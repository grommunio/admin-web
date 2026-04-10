import { PartialWithRequired } from "./common"

export type FolderContainer = 'IPF.Note' | 'IPF.Contact' | 'IPF.Appointment' | 'IPF.Stickynote' | 'IPF.Task';

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
  container: FolderContainer,
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
