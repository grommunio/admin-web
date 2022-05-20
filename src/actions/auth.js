// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  AUTH_AUTHENTICATING,
  AUTH_AUTHENTICATED,
  AUTH_ERROR,
  PROFILE_DATA_RECEIVED,
  DRAWER_DOMAINS_REVEICED,
  DRAWER_DOMAINS_FETCH,
} from '../actions/types';
import { login, renewToken, profile, drawerDomains } from '../api';

export function authLogin(user, pass) {
  return async dispatch => {
    try {
      const { grommunioAuthJwt: token, csrf } = await dispatch(login(user, pass));
      if(token) {
        document.cookie = "grommunioAuthJwt=" + token + ';path=/'
          + (window.location.protocol === 'https:' ? ';secure' : '');
        window.localStorage.setItem('grommunioAuthJwt', token);
        const profileData = await dispatch(profile());
        await dispatch({ type: PROFILE_DATA_RECEIVED, data: profileData });
        if(profileData) {
          await dispatch({ type: DRAWER_DOMAINS_FETCH });
          const domains = await dispatch(drawerDomains());
          await dispatch({ type: DRAWER_DOMAINS_REVEICED, data: domains });
          await dispatch(authAuthenticated(true, profileData.capabilities, csrf));
        } else {
          clearStorage();
          await dispatch(authError("No profile data received"));
        }
      } else {
        clearStorage();
        await dispatch(authError("No token received"));
      }
    } catch(err) {
      clearStorage();
      console.error(err.message);
      await dispatch(authError(err.message));
      return Promise.reject(err);
    }
  };
}

export function authLoginWithToken(token) {
  return async dispatch => {
    document.cookie = "grommunioAuthJwt=" + token + ';path=/'
      + (window.location.protocol === 'https:' ? ';secure' : '');
    try {
      const { grommunioAuthJwt: newToken, csrf } = await dispatch(renewToken());
      if(newToken) {
        document.cookie = "grommunioAuthJwt=" + newToken + ';path=/'
          + (window.location.protocol === 'https:' ? ';secure' : '');
        window.localStorage.setItem('grommunioAuthJwt', newToken);
      }
      const profileData = await dispatch(profile());
      await dispatch({ type: PROFILE_DATA_RECEIVED, data: profileData });
      if(profileData) {
        await dispatch({ type: DRAWER_DOMAINS_FETCH });
        const domains = await dispatch(drawerDomains());
        await dispatch({ type: DRAWER_DOMAINS_REVEICED, data: domains });
        await dispatch(authAuthenticated(true, profileData.capabilities, csrf));
      } else {
        clearStorage();
        await dispatch(authError("No profile data received"));
      }
    } catch(err) {
      clearStorage();
      await dispatch(authError("No token received"));
      return Promise.reject(err);
    }
  };
}

export function authLogout() {
  clearStorage();
  return authAuthenticated(false);
}

export function authAuthenticating(authenticating = true) {
  return {
    type: AUTH_AUTHENTICATING,
    authenticating,
  };
}

export function authAuthenticated(authenticated = true, capabilities=[], csrf='') {
  return {
    type: AUTH_AUTHENTICATED,
    authenticated,
    capabilities,
    csrf,
  };
}

function authError(error) {
  return {
    type: AUTH_ERROR,
    error,
  };
}

function clearStorage() {
  window.localStorage.removeItem('grommunioAuthJwt');
  document.cookie = "grommunioAuthJwt=;path=/" + (window.location.protocol === 'https:' ? ';secure' : '');
}
