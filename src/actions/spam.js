import { spam } from "../api";
import { defaultListHandler } from "./handlers";
import { SPAM_DATA_RECEIVED } from "./types";


export function getSpamData() {
  return defaultListHandler(spam, SPAM_DATA_RECEIVED);
}
