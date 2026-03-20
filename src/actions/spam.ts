import { spam, spamHistory } from "../api";
import { defaultListHandler } from "./handlers";
import { SPAM_DATA_RECEIVED, SPAM_HISTORY_RECEIVED } from "./types";


export function getSpamData() {
  return defaultListHandler(spam, SPAM_DATA_RECEIVED);
}

export function fetchSpamHistory() {
  return defaultListHandler(spamHistory, SPAM_HISTORY_RECEIVED);
}
