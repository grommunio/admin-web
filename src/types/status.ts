type Responses = {
  "1xx": number;
  "2xx": number;
  "3xx": number;
  "4xx": number;
  "5xx": number;
  miss?: number;
  bypass?: number;
  expired?: number;
  stale?: number;
  updating?: number;
  revalidated?: number;
  hit?: number;
  scarce?: number;
};

type TimeSeries = {
  times: number[];
  msecs: number[];
};

type Buckets = {
  msecs: number[];
  counters: number[];
};

type OverCounts = {
  maxIntegerSize: number;
  requestCounter: number;
  inBytes: number;
  outBytes: number;
  "1xx": number;
  "2xx": number;
  "3xx": number;
  "4xx": number;
  "5xx": number;
  miss?: number;
  bypass?: number;
  expired?: number;
  stale?: number;
  updating?: number;
  revalidated?: number;
  hit?: number;
  scarce?: number;
  requestMsecCounter: number;
  responseMsecCounter?: number;
};

export type ServerZone = {
  requestCounter: number;
  inBytes: number;
  outBytes: number;
  responses: Responses;
  requestMsecCounter: number;
  requestMsec: number;
  requestMsecs: TimeSeries;
  requestBuckets: Buckets;
  overCounts: OverCounts;
  time: number;
};

type Upstream = {
  server: string;
  requestCounter: number;
  inBytes: number;
  outBytes: number;
  responses: Responses;
  requestMsecCounter: number;
  requestMsec: number;
  requestMsecs: TimeSeries;
  requestBuckets: Buckets;

  responseMsecCounter: number;
  responseMsec: number;
  responseMsecs: TimeSeries;
  responseBuckets: Buckets;

  weight: number;
  maxFails: number;
  failTimeout: number;
  backup: boolean;
  down: boolean;

  overCounts: OverCounts;
};

export type Connections = {
  active: number;
  reading: number;
  writing: number;
  waiting: number;
  accepted: number;
  handled: number;
  requests: number;
};

export type SharedZones = {
  name: string;
  maxSize: number;
  usedSize: number;
  usedNode: number;
}

export type ServerZones = Record<string, ServerZone>;
export type UpstreamZones = Record<string, Upstream[]>;
export type FilterZones = Record<string, ServerZones>;

export type VhostStatus = {
  hostName: string;
  moduleVersion: string;
  nginxVersion: string;
  loadMsec: number;
  nowMsec: number;

  connections: Connections;

  sharedZones: SharedZones;
  serverZones: ServerZones;
  upstreamZones: UpstreamZones;
  filterZones: FilterZones;
};