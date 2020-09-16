import {
  DASHBOARD_DATA_ERROR,
  DASHBOARD_DATA_FETCH,
  DASHBOARD_DATA_RECEIVED,
} from '../actions/types';
import { dashboard } from '../api';

export function fetchDashboardData() {
  return async dispatch => {
    await dispatch({ type: DASHBOARD_DATA_FETCH });
    try {
      const dashboardData = await dispatch(dashboard());
      await dispatch({ type: DASHBOARD_DATA_RECEIVED, data: dashboardData });
    } catch(error) {
      await dispatch({ type: DASHBOARD_DATA_ERROR, error});
      console.error(error);
      return Promise.reject(error.message);
    }
  };
}