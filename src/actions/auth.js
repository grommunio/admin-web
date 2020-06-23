import {
  AUTH_AUTHENTICATING,
  AUTH_AUTHENTICATED,
} from '../actions/types';

export function authLogin() {
}

export function authLoginWithToken() {
}

export function authLogout() {
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
