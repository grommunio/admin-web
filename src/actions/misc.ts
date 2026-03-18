import { update } from "../api";
import { defaultDetailsHandler } from "./handlers";

export function systemUpdate(action: string, repo?: string) {
  return defaultDetailsHandler(update, action, repo);
}
