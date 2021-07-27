import { mailq } from '../api';

export function fetchMailQData() {
  return async dispatch => {
    try {
      const response = await dispatch(mailq());
      return Promise.resolve(response);
    } catch(error) {
      console.error(error);
      return Promise.resolve(error.message);
    }
  };
}