import { update } from "../api";
import { defaultDetailsHandler } from "./handlers";

export function systemUpdate(...endpointParams) {
  return defaultDetailsHandler(update, ...endpointParams);
}