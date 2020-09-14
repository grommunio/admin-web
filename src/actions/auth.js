import {
  AUTH_AUTHENTICATING,
  AUTH_AUTHENTICATED,
} from '../actions/types';

export function authLogin(user, pw, role) {
  window.localStorage.setItem('grammmAuthToken', user + pw);
  return authAuthenticated(true, role);
}

export function authLoginWithToken(grammmAuthToken) {
  return authAuthenticated(true, grammmAuthToken === 'rootroot' ? 'sys' : 'domain');
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

export function authAuthenticated(authenticated = true, role) {
  return {
    type: AUTH_AUTHENTICATED,
    authenticated,
    role,
  };
}
