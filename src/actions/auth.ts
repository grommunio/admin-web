// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  AUTH_AUTHENTICATED,
  AUTH_ERROR,
  PROFILE_DATA_RECEIVED,
  DRAWER_DOMAINS_REVEICED,
  TOKEN_REFRESH,
} from './types';
import { login, logout, renewToken, profile, drawerDomains } from '../api';
import { Dispatch } from 'redux';
import { ApiError } from '@/types/common';

// Login marker, the token is kept in the cookie only
const SESSION_KEY = 'grommunioSession';


export function authLogin(user: string, pass: string) {
  return async (dispatch: Dispatch) => {
    try {
      const { grommunioAuthJwt: token, csrf } = await login(user, pass);
      authenticate(dispatch, token, csrf);
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
      const { grommunioAuthJwt: token, csrf } = await renewToken();
      if(csrf) {
        if(token) setCookie(token);
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

export function authLoginWithToken(storedToken: string) {
  return async (dispatch: Dispatch) => {
    setCookie(storedToken);
    try {
      const { grommunioAuthJwt: token, csrf } = await renewToken();
      authenticate(dispatch, token, csrf);
    } catch(err) {
      clearStorage();
      const message = (err as ApiError).message;
      dispatch(authError(message || "Session expired. Please re-login"));
      return Promise.reject(err);
    }
  };
}

/**
 * Login with the session cookie (after single sign-on or a reload)
 */
export function authLoginWithSession() {
  return async (dispatch: Dispatch) => {
    try {
      const { grommunioAuthJwt: token, csrf } = await renewToken();
      authenticate(dispatch, token, csrf);
    } catch(err) {
      clearStorage();
      return Promise.reject(err);
    }
  };
}

// admin-api >= 1.22 returns no token on renewal
async function authenticate(dispatch: Dispatch, token?: string, csrf?: string) {
  if(csrf) {
    if(token) setCookie(token);
    window.localStorage.removeItem('grommunioAuthJwt');
    window.localStorage.setItem(SESSION_KEY, '1');
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
    dispatch(authError("No token received. Please re-login"));
  }
}

// For admin-api < 1.22, newer versions set an HttpOnly cookie
function setCookie(token: string) {
  document.cookie = "grommunioAuthJwt=" + token + ';path=/'
    + (window.location.protocol === 'https:' ? ';secure' : '');
}

export function authLogout() {
  return async (dispatch: Dispatch) => {
    await logout().catch(() => null);
    clearStorage();
    dispatch(authAuthenticated(false));
  };
}

export function authAuthenticated(authenticated = true, capabilities: string[]=[], csrf='') {
  return {
    type: AUTH_AUTHENTICATED,
    authenticated,
    capabilities,
    csrf,
  };
}

export function authError(error: string) {
  return {
    type: AUTH_ERROR,
    error,
  };
}

export function hasSession() {
  return window.localStorage.getItem(SESSION_KEY) !== null;
}

function clearStorage() {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem('grommunioAuthJwt');
  document.cookie = "grommunioAuthJwt=;path=/" + (window.location.protocol === 'https:' ? ';secure' : '');
}
