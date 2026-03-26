type FullCreateParams = {
  smtp: boolean;
  changePassword: boolean;
  pop3_imap: boolean;
  lang: string;
  privChat: boolean;
  privWeb: boolean;
  privVideo: boolean;
  privFiles: boolean;
  privArchive: boolean;
  privEas: boolean;
  privDav: boolean;
  properties: {
    storagequotalimit: number;
    prohibitreceivequota: number;
    prohibitsendquota: number;
  }
}

export type CreateParams = Partial<FullCreateParams>;