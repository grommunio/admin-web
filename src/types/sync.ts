import { BoolNumber, TriState } from "./common";

export type FetchSyncParams = {
  filterEnded: number,
  filterUpdated: number,
}

export type RemoteWipeParams = {
  password: string,
  status: number,
}

export type DeviceSyncInfo = {
  deviceid: string;
  deviceuser: string;
  lastconnecttime: number;
  wipeStatus: number;
  devicetype: string;
  useragent: string;
  firstsynctime: number;
  lastupdatetime: number;
  asversion: string;
  foldersSyncable: number;
  foldersSynced: number;
}

export type ActiveSyncSession = {
  pid: number;
  ip: string;
  user: string;
  start: number;
  devtype: string;
  devid: string;
  devagent: string;
  command: number;
  ended: number;
  push: boolean;
  addinfo: string;
  update: number;
  asversion: string;
};

export type ActiveSyncSessionRow = {
  diff: number;
  justUpdated: boolean;
} & ActiveSyncSession;

export type SyncPolicy = {
  allowbluetooth: TriState;
  allowbrowser: BoolNumber;
  allowcam: BoolNumber;
  allowconsumeremail: number;
  allowdesktopsync: number;
  allowhtmlemail: number;
  allowinternetsharing: number;
  allowirda: number;
  allowpopimapemail: number;
  allowremotedesk: number;
  allowsimpledevpw: number;
  allowsmimeencalgneg: number;
  allowsmimesoftcerts: number;
  allowstoragecard: number;
  allowtextmessaging: number;
  allowunsignedapps: number;
  allowunsigninstallpacks: number;
  allowwifi: number;
  alphanumpwreq: number;
  approvedapplist: unknown[];
  attenabled: number;
  devencenabled: number;
  devpwenabled: number;
  devpwexpiration: number;
  devpwhistory: number;
  maxattsize: number;
  maxcalagefilter: number;
  maxdevpwfailedattempts: number;
  maxemailagefilter: number;
  maxemailbodytruncsize: number;
  maxemailhtmlbodytruncsize: number;
  maxinacttimedevlock: number;
  mindevcomplexchars: number;
  mindevpwlenngth: number;
  pwrecoveryenabled: number;
  reqdevenc: number;
  reqencsmimealgorithm: number;
  reqencsmimemessages: number;
  reqmansyncroam: number;
  reqsignedsmimealgorithm: number;
  reqsignedsmimemessages: number;
  reqstoragecardenc: number;
  unapprovedinromapplist: unknown[];
};
