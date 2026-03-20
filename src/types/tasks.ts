export type Task = {
  ID: number;
  command: string;
  created: string;
  message: string;
  params: Record<string, string | number | boolean>;
  state: number;
  updated: string;
};

export type TaskListItem = Omit<Task, 'params'>;
