import { PartialWithRequired } from "./common";

export type ServerPolicy = 
  'round-robin' |
  'balanced' |
  'first' |
  'last' |
  'random';

export type Server = {
  ID: number,
  domains: number,
  extname: string,
  hostname: string,
  users: number,
}

export type ServerListItem = Omit<Server, 'domains' | 'users'>
export type NewServer = Pick<Server, 'extname' | 'hostname'>;
export type UpdateServer = PartialWithRequired<Server, "ID">;