import { GLOBAL_USERS_FILTER_STATE } from "./types";

export function setFilterState(prop: string, value: string | number | boolean) {
  return {
    type: GLOBAL_USERS_FILTER_STATE,
    prop,
    value
  };
}
