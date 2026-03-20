type DnsValue = {
  externalDNS: string | null;
  internalDNS: string | null;
};

type DnsValueWithIp = {
  externalDNS: string | null;
  internalDNS: string | null;
  ip: string;
};

type MxRecords = {
  externalDNS: string | null;
  internalDNS: string | null;
  mxDomain: string;
  reverseLookup: string | null;
};

export type DnsCheck = {
  autoconfig: DnsValue;
  autodiscover: DnsValue;
  autodiscoverSRV: DnsValueWithIp;
  caldavSRV: DnsValue;
  caldavTXT: DnsValue;
  caldavsSRV: DnsValue;
  carddavSRV: DnsValue;
  carddavTXT: DnsValue;
  carddavsSRV: DnsValue;
  dkim: DnsValue;
  dmarc: DnsValue;
  externalIp: string;
  imapSRV: DnsValue;
  imapsSRV: DnsValue;
  localIp: string;
  mxRecords: MxRecords;
  pop3SRV: DnsValue;
  pop3sSRV: DnsValue;
  submissionSRV: DnsValue;
  txt: DnsValue;
};

type DnsValueKeys<T> = {
  [K in keyof T]: T[K] extends DnsValue ? K : never;
}[keyof T];

export type DnsHealthDnsValueOnly = Pick<DnsCheck, DnsValueKeys<DnsCheck>>;
