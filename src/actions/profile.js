import {
  PROFILE_DATA_FETCH,
  PROFILE_DATA_RECEIVED,
  PROFILE_DATA_ERROR,
} from '../actions/types';
import { profile } from '../api';

export function fetchProfileData() {
  return async dispatch => {
    await dispatch({ type: PROFILE_DATA_FETCH });
    try {
      const response = await dispatch(profile());
      await dispatch({ type: PROFILE_DATA_RECEIVED, data: response });
    } catch(error) {
      await dispatch({ type: PROFILE_DATA_ERROR, error});
      console.error(error);
    }
  };
}
