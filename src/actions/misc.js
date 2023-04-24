import { SET_TOPBAR_TITLE } from "./types";

export function setTopbarTitle(title="") {
  return {
    type: SET_TOPBAR_TITLE,
    title,
  }
}