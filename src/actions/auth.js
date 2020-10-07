import {
  AUTH_AUTHENTICATING,
  AUTH_AUTHENTICATED,
  AUTH_ERROR,
} from '../actions/types';
import { login } from '../api';

/*export function authLogin(user, pw, role) {
  window.localStorage.setItem('grammmAuthJwt', user + pw);
  return authAuthenticated(true, role);
}*/

export function authLogin(user, pass) {
  return async dispatch => {
    try {
      const responseJSON = await dispatch(login(user, pass));
      const token = responseJSON.grammmAuthJwt;
      if(token) {
        window.localStorage.setItem('grammmAuthJwt', token);
        document.cookie = "grammmAuthJwt=" + token + ';path=/;secure';
        await dispatch(authAuthenticated(true, 'sys'));
      } else {
        window.localStorage.removeItem('grammmAuthJwt');
        document.cookie = "grammmAuthJwt=;path=/;secure";
        await dispatch(authError());
      }
    } catch(err) {
      window.localStorage.removeItem('grammmAuthJwt');
      document.cookie = "grammmAuthJwt=;path=/;secure";
      console.error(err);
      await dispatch(authError());
      return Promise.reject(err);
    }
  };
}

export function authLoginWithToken() {
  return authAuthenticated(true, 'sys');
}

export function authLogout() {
  window.localStorage.removeItem('grammmAuthJwt');
  return authAuthenticated(false);
}

export function authAuthenticating(authenticating = true) {
  return {
    type: AUTH_AUTHENTICATING,
    authenticating,
  };
}

export function authAuthenticated(authenticated = true, role) {
  return {
    type: AUTH_AUTHENTICATED,
    authenticated,
    role,
  };
}

function authError() {
  return {
    type: AUTH_ERROR,
  };
}
