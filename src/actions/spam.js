import { spam, spamThroughput } from "../api";
import { defaultListHandler } from "./handlers";
import { SPAM_DATA_RECEIVED, SPAM_THROUGHPUT_RECEIVED } from "./types";


export function getSpamData() {
  return defaultListHandler(spam, SPAM_DATA_RECEIVED);
}

export function getSpamThroughput() {
  return defaultListHandler(spamThroughput, SPAM_THROUGHPUT_RECEIVED);
}
