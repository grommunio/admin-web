import {
  AUTH_AUTHENTICATING,
  AUTH_AUTHENTICATED,
  AUTH_ERROR,
} from '../actions/types';
import { login, profile } from '../api';
import { SYS_ADMIN, DOM_ADMIN } from '../constants';

export function authLogin(user, pass) {
  return async dispatch => {
    try {
      const responseJSON = await dispatch(login(user, pass));
      const token = responseJSON.grammmAuthJwt;
      if(token) {
        window.localStorage.setItem('grammmAuthJwt', token);
        document.cookie = "grammmAuthJwt=" + token + ';path=/;secure';
        const profileData = await dispatch(profile());
        if(profileData) {
          await dispatch(authAuthenticated(true, profileData.capabilities.includes('SystemAdmin')
            ? SYS_ADMIN : DOM_ADMIN));
        } else {
          clearStorage();
        }
      } else {
        clearStorage();
        await dispatch(authError());
      }
    } catch(err) {
      clearStorage();
      console.error(err);
      await dispatch(authError());
      return Promise.reject(err);
    }
  };
}

export function authLoginWithToken(token) {
  return async dispatch => {
    document.cookie = "grammmAuthJwt=" + token + ';path=/;secure';
    try {
      const profileData = await dispatch(profile());
      if(profileData) {
        await dispatch(authAuthenticated(true, profileData.capabilities.includes('SystemAdmin')
          ? SYS_ADMIN : DOM_ADMIN));
      } else {
        clearStorage();
        await dispatch(authError());
      }
    } catch(err) {
      clearStorage();
      await dispatch(authError());
      return Promise.reject(err);
    }
  };
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

function clearStorage() {
  window.localStorage.removeItem('grammmAuthJwt');
  document.cookie = "grammmAuthJwt=;path=/;secure";
}