// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import {
  DASHBOARD_DATA_RECEIVED,
  AUTH_AUTHENTICATED,
} from '../actions/types';

const defaultState = {
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

function addUsageData(currentState, values) {
  const state = structuredClone({...currentState});
  Object.keys(values).forEach(key => {
    const usage = state[key];
    usage.push(values[key]);
    if(usage.length > 20) usage.shift(); 
  });
  return state;
}

function getMemoryPieValues(data) {
  return [
    data.free,
    data.used,
    data.buffer,
    data.cache,
  ];
}

function dashboardReducer(state = defaultState, action) {
  const timer = state.timer;
  switch (action.type) {

  case DASHBOARD_DATA_RECEIVED:
    return {
      ...state,
      Dashboard: {
        cpuPercent: addUsageData(state.Dashboard.cpuPercent, action.data.cpuPercent),
        cpuPie: {
          labels: Object.keys(action.data.cpuPercent),
          values: Object.values(action.data.cpuPercent),
        },
        memory: addUsageData(state.Dashboard.memory, action.data.memory),
        memoryPie: {
          labels: ["Free", "Used", "Buffer", "Cache"],
          values: getMemoryPieValues(action.data.memory),
        },
      },
      disks:  action.data.disks || [],
      load: action.data.load || [],
      timer: (timer + 1) % 10,
    };

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
