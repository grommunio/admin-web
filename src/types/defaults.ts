export type CreateParamProperty = 'storagequotalimit' | 'prohibitreceivequota' | 'prohibitsendquota';

type FullCreateParams = {
  maxUser: number;
  smtp: boolean;
  changePassword: boolean;
  pop3_imap: boolean;
  lang: string;
  chat: boolean;
  privChat: boolean;
  privWeb: boolean;
  privVideo: boolean;
  privFiles: boolean;
  privArchive: boolean;
  privEas: boolean;
  privDav: boolean;
  chatUser: boolean;
  chatTeam: boolean;
  properties: {
    storagequotalimit?: number;
    prohibitreceivequota?: number;
    prohibitsendquota?: number;
  }
}

export type CreateParams = Partial<FullCreateParams>;