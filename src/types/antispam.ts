export type AntiSpamResponse = {
  subject: string;
  sender_smtp: string;
  rcpt_smtp: string[];
  "message-id": string;
  unix_time: number;
}