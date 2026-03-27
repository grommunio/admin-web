export type TaskParam = {
  username: string;
  code: number;
  message: string;
}

export type Task = {
  ID: number;
  command: string;
  created: string;
  message: string;
  params: Record<string, TaskParam[]>;
  state: number;
  updated: string;
};

export type TaskListItem = Omit<Task, 'params'>;
