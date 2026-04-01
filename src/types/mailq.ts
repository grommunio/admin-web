export type Recipient = {
  address: string;
  delay_reason: string;
}

export type PostqueueRow = {
  queue_id: string;
  queue_name: string;
  arrival_time: number;
  sender: string;
  recipients: Recipient[];
}
