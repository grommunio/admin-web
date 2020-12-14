// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import {
  DRAWER_OPEN_DEFAULT,
  DRAWER_CLOSE_DEFAULT,
  DRAWER_EXPAND,
  DRAWER_SELECTION,
  DRAWER_VIEW,
  DOMAIN_DATA_ERROR,
  DRAWER_DOMAINS_REVEICED,
} from '../actions/types';
import { drawerDomains } from '../api';

export function fetchDrawerDomains() {
  return async dispatch => {
    try {
      const domains = await dispatch(drawerDomains());
      await dispatch({ type: DRAWER_DOMAINS_REVEICED, data: domains });
    } catch (err) {
      await dispatch({type: DOMAIN_DATA_ERROR, error: 'Failed to fetch domains'});
      console.error('Failed to fetch domains', err);
      return Promise.reject(err.message);
    }
  };
}

export function setDrawerSelected(page) {
  return async dispatch => {
    await dispatch(drawerSelection(page));
  };
}

export function setDrawerDefault(bool) {
  return async dispatch => {
    await bool ? dispatch(drawerDefaultOpen()) : dispatch(drawerDefaultClose());
  };
}

export function setDrawerExpansion() {
  return drawerExpand();
}

export function toggleView() {
  return {
    type: DRAWER_VIEW,
  };
}

function drawerSelection(page) {
  return {
    type: DRAWER_SELECTION,
    page,
  };
}

function drawerExpand() {
  return {
    type: DRAWER_EXPAND,
  };
}

function drawerDefaultOpen() {
  return {
    type: DRAWER_OPEN_DEFAULT,
  };
}

function drawerDefaultClose() {
  return {
    type: DRAWER_CLOSE_DEFAULT,
  };
}
