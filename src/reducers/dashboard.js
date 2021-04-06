// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  DASHBOARD_DATA_ERROR,
  DASHBOARD_DATA_FETCH,
  DASHBOARD_DATA_RECEIVED,
} from '../actions/types';

const defaultState = {
  loading: false,
  error: null,
  Dashboard: {
    disks: [],
    load: [],
    cpuPercent: [],
    memory: [],
    swap: [],
    booted: '',
    swapPercent: 0,
  },
};

function addUsageData(arr, item) {
  const copy = [...arr];
  copy.push(item);
  if(copy.length > 20) copy.shift(); 
  return copy;
}

function formatSwap(obj) {
  return [
    { name: 'used', value: obj.used, color: 'gradientGreen' },
    { name: 'free', value: obj.free, color: 'gradientBlue' },
    //{ name: 'total', value: obj.total },
  ];
}

function formatDisks(arr) {
  const formattedArr = [];
  for(let i = 0; i < arr.length; i++) {
    formattedArr.push({
      ...arr[i],
      label: `${(arr[i].used / 1000000000).toFixed(1)}/${(arr[i].total / 1000000000).toFixed(1)}GB`,
    });
  }
  return formattedArr;
}

function formatLoad(arr) {
  return [
    { time: '1 Min', value: arr[0] },
    { time: '5 Mins', value: arr[1] },
    { time: '15 Mins', value: arr[2] },
  ];
}

function dashboardReducer(state = defaultState, action) {
  switch (action.type) {
    case DASHBOARD_DATA_FETCH:
      return {
        ...state,
        loading: true,
      };

    case DASHBOARD_DATA_RECEIVED:
      return {
        ...state,
        loading: false,
        error: null,
        Dashboard: {
          ...action.data,
          cpuPercent: addUsageData(state.Dashboard.cpuPercent, action.data.cpuPercent),
          memory: addUsageData(state.Dashboard.memory, action.data.memory),
          swap: formatSwap(action.data.swap),
          disks: formatDisks(action.data.disks),
          swapPercent: action.data.swap.percent,
          load: formatLoad(action.data.load),
        },
      };
    
    case DASHBOARD_DATA_ERROR: {
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    }

    default:
      return state;
  }
}

export default dashboardReducer;
