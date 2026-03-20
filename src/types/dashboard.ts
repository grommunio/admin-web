export type Service = {
  autostart: string;
  description: string;
  name: string;
  since: string;
  state: string;
  substate: string;
  unit: string;
};

export type Disk = {
  device: string;
  filesystem: string;
  free: number;
  mountpoint: string;
  percent: number;
  total: number;
  used: number;
}

export type CPUPercent = {
  idle: number[];
  interrupt: number[];
  io: number[];
  steal: number[];
  system: number[];
  user: number[];
};

export type Memory = {
  used: number[];
  free: number[];
  buffer: number[];
  cache: number[];
  percent: number[];
  total: number[];
  available: number[];
};
