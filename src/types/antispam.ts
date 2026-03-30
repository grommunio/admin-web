export type AntiSpamResponse = {
  subject: string;
  sender_smtp: string;
  rcpt_smtp: string[];
  "message-id": string;
  unix_time: number;
}

export type SpamAction = "no action" | "add header" | "greylist" | "reject";

export type AntiSpamRow = AntiSpamResponse & {
  id: string;
  rcpt_smtp: string;
  action: SpamAction;
  score: number;
  ip: string;
  size: number;
  time_real: number;
}
