// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { CPUPercent, Disk, Memory } from '@/types/dashboard';
import {
  DASHBOARD_DATA_RECEIVED,
  AUTH_AUTHENTICATED,
} from '../actions/types';
import { LegacyAction } from './types';

export type DashboardState = {
  timer: number;
  Dashboard: {
    cpuPercent: CPUPercent;
    cpuPie: {
      labels: string[];
      values: number[];
    };
    memory: Memory;
    memoryPie: {
      labels: string[];
      values: number[];
    };
    booted: string;
  };
  disks: Disk[];
  load: number[];
};

const defaultState: DashboardState = {
  timer: -1,
  Dashboard: {
    cpuPercent: {
      idle: [],
      interrupt: [],
      io: [],
      steal: [],
      system: [],
      user: [],
    },
    cpuPie: {
      labels: [],
      values: [],
    },
    memory: {
      used: [],
      free: [],
      buffer: [],
      cache: [],
      percent: [],
      total: [],
      available: [],
    },
    memoryPie: {
      labels: [],
      values: [],
    },
    booted: '',
  },
  disks: [],
  load: [],
};

function addUsageData<T extends Record<string, number[]>>(currentState: T, values: Record<string, number>): T {
  const state: T = structuredClone({...currentState});
  Object.keys(values).forEach(key => {
    const usage = state[key];
    usage.push(values[key]);
    if(usage.length > 20) usage.shift(); 
  });
  return state;
}

function getMemoryPieValues(data: { used: number, buffer: number, cache: number, free: number }) {
  return [
    data.used,
    data.buffer,
    data.cache,
    data.free,
  ];
}

function dashboardReducer(state: DashboardState = defaultState, action: LegacyAction) {
  const timer = state.timer;
  switch (action.type) {

  case DASHBOARD_DATA_RECEIVED: {
    const { cpuPercent, memory, disks, load } = action.data;
    return {
      ...state,
      Dashboard: {
        cpuPercent: addUsageData(state.Dashboard.cpuPercent, cpuPercent),
        cpuPie: {
          labels: ["User", "System", "Interrupt", "Steal", "IO", "Idle"],
          values: ["user", "system", "interrupt", "steal", "io", "idle"].map(v => cpuPercent[v]),
        },
        memory: addUsageData(state.Dashboard.memory, memory),
        memoryPie: {
          labels: ["Used", "Buffer", "Cache", "Free"],
          values: getMemoryPieValues(memory),
        },
      },
      disks:  disks || [],
      load: load || [],
      timer: (timer + 1) % 10,
    };
  }

  case AUTH_AUTHENTICATED:
    return action.authenticated ? {
      ...state,
    } : {
      ...defaultState,
    };

  default:
    return state;
  }
}

export default dashboardReducer;
