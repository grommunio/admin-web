import { GLOBAL_USERS_FILTER_STATE } from "./types";

export function setFilterState(prop, value) {
  return {
    type: GLOBAL_USERS_FILTER_STATE,
    prop,
    value
  };
}
