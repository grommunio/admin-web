import { update } from "../api";
import { defaultDetailsHandler } from "./handlers";
import { SET_TOPBAR_TITLE } from "./types";

export function setTopbarTitle(title="") {
  return {
    type: SET_TOPBAR_TITLE,
    title,
  }
}

export function systemUpdate(...endpointParams) {
  return defaultDetailsHandler(update, ...endpointParams);
}