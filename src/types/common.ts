export type KeyValuePair<T> = {
  key: string;
  value: T;
};

export type PartialWithRequired<T, K extends keyof T> =
  Pick<T, K> & Partial<Omit<T, K>>;

export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;