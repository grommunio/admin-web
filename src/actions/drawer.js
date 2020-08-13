import {
  DRAWER_OPEN_DEFAULT,
  DRAWER_CLOSE_DEFAULT,
  DRAWER_EXPAND,
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

export function setDrawerExpansion() {
  return  drawerExpand();
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