import { taskq, startTaskq, stopTaskq, taskqStatus } from '../api';
import { TASK_DATA_RECEIVED, TASK_STATUS_RECEIVED } from './types';

export function fetchTaskqData(params) {
  return async dispatch => {
    try {
      const data = await dispatch(taskq(params));
      await dispatch({ type: TASK_DATA_RECEIVED, data });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function fetchTaskqStatus(params) {
  return async dispatch => {
    try {
      const data = await dispatch(taskqStatus(params));
      await dispatch({ type: TASK_STATUS_RECEIVED, data });
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function startTaskqServer(params) {
  return async dispatch => {
    try {
      await dispatch(startTaskq(params));
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}

export function stopTaskqServer(params) {
  return async dispatch => {
    try {
      await dispatch(stopTaskq(params));
    } catch(error) {
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}
