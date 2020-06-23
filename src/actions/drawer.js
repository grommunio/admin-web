import {
  DRAWER_OPEN_DEFAULT,
  DRAWER_CLOSE_DEFAULT,
  DRAWER_EXPAND,
  DRAWER_CLOSE,
  DRAWER_SELECTION,
} from '../actions/types';

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

export function setDrawerExpansion(bool) {
  return async dispatch => {
    await bool ? dispatch(drawerExpand()) : dispatch(drawerClose());
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

function drawerClose() {
  return {
    type: DRAWER_CLOSE,
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