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
      if(token && csrf) {
        setCookie(token);
        window.localStorage.setItem('grommunioAuthJwt', token);
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

async function authenticate(dispatch: Dispatch, token?: string, csrf?: string) {
  if(token) {
    setCookie(token);
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
    dispatch(authError("No token received. Please re-login"));
  }
}

function setCookie(token: string) {
  document.cookie = "grommunioAuthJwt=" + token + ';path=/'
    + (window.location.protocol === 'https:' ? ';secure' : '');
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
