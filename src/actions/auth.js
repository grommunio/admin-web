import {
  AUTH_AUTHENTICATING,
  AUTH_AUTHENTICATED,
} from '../actions/types';

export function authLogin(user, pw) {
  window.localStorage.setItem('grammmAuthToken', user + pw);
  return authAuthenticated(true);
}

export function authLoginWithToken() {
  return authAuthenticated(true);
}

export function authLogout() {
  window.localStorage.removeItem('grammmAuthToken');
  return authAuthenticated(false);
}


export function authAuthenticating(authenticating = true) {
  return {
    type: AUTH_AUTHENTICATING,
    authenticating,
  };
}

export function authAuthenticated(authenticated = true) {
  return {
    type: AUTH_AUTHENTICATED,
    authenticated,
  };
}
