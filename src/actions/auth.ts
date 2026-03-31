// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  AUTH_ERROR,
  PROFILE_DATA_RECEIVED,
  DRAWER_DOMAINS_REVEICED,
  TOKEN_REFRESH,
} from './types';
import { login, renewToken, profile, drawerDomains } from '../api';
import { Dispatch } from 'redux';
import { ApiError } from '@/types/common';


export function authLogin(user: string, pass: string) {
  return async (dispatch: Dispatch) => {
    try {
      const { grommunioAuthJwt: token, csrf } = await login(user, pass);
      if(token) {
        document.cookie = "grommunioAuthJwt=" + token + ';path=/'
          + (window.location.protocol === 'https:' ? ';secure' : '');
        window.localStorage.setItem('grommunioAuthJwt', token);
        const profileData = await profile();
        dispatch({ type: PROFILE_DATA_RECEIVED, data: profileData });
        if(profileData) {
          const domains = await drawerDomains();
          dispatch({ type: DRAWER_DOMAINS_REVEICED, data: domains });
          dispatch(authAuthenticated(true, profileData.capabilities, csrf));
        } else {
          clearStorage();
          dispatch(authError("No profile data received"));
        }
      } else {
        clearStorage();
        dispatch(authError("No token received"));
      }
    } catch(err) {
      clearStorage();
      const message = (err as ApiError).message;
      dispatch(authError(message));
      return Promise.reject(message);
    }
  };
}

export function refreshToken() {
  return async (dispatch: Dispatch) => {
    try {
      const { grommunioAuthJwt: newToken, csrf } = await renewToken();
      if(newToken && csrf) {
        document.cookie = "grommunioAuthJwt=" + newToken + ';path=/'
          + (window.location.protocol === 'https:' ? ';secure' : '');
        window.localStorage.setItem('grommunioAuthJwt', newToken);
        dispatch({ type: TOKEN_REFRESH, csrf });
      }
      return Promise.resolve();
    } catch(err) {
      clearStorage();
      const message = (err as ApiError).message;
      dispatch(authError(message || "Failed to refresh token"));
      return Promise.reject(err);
    }
  }
}

// TODO: Deduplicate
export function authLoginWithToken(token: string) {
  return async (dispatch: Dispatch) => {
    document.cookie = "grommunioAuthJwt=" + token + ';path=/'
      + (window.location.protocol === 'https:' ? ';secure' : '');
    try {
      const { grommunioAuthJwt: newToken, csrf } = await renewToken();
      if(newToken) {
        document.cookie = "grommunioAuthJwt=" + newToken + ';path=/'
          + (window.location.protocol === 'https:' ? ';secure' : '');
        window.localStorage.setItem('grommunioAuthJwt', newToken);
      }
      const profileData = await profile();
      dispatch({ type: PROFILE_DATA_RECEIVED, data: profileData });
      if(profileData) {
        const domains = await drawerDomains();
        dispatch({ type: DRAWER_DOMAINS_REVEICED, data: domains });
        dispatch(authAuthenticated(true, profileData.capabilities, csrf));
      } else {
        clearStorage();
        dispatch(authError("No profile data received"));
      }
    } catch(err) {
      clearStorage();
      const message = (err as ApiError).message;
      dispatch(authError(message || "Session expired. Please login again"));
      return Promise.reject(err);
    }
  };
}

export function authLogout() {
  clearStorage();
  return authAuthenticated(false);
}

export function authAuthenticated(authenticated = true, capabilities: string[]=[], csrf='') {
  return {
    type: AUTH_AUTHENTICATED,
    authenticated,
    capabilities,
    csrf,
  };
}

function authError(error: string) {
  return {
    type: AUTH_ERROR,
    error,
  };
}

function clearStorage() {
  window.localStorage.removeItem('grommunioAuthJwt');
  document.cookie = "grommunioAuthJwt=;path=/" + (window.location.protocol === 'https:' ? ';secure' : '');
}
