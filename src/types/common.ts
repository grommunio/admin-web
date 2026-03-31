import { Domain } from "./domains";

export type KeyValuePair<T> = {
  key: string;
  value: T;
};

export type PartialWithRequired<T, K extends keyof T> =
  Pick<T, K> & Partial<Omit<T, K>>;

export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

export type BoolNumber = 0 | 1;
export type TriState = 0 | 1 | 2;

export type DomainViewProps = {
  domain: Domain;
}

export type ApiError = {
  message: string;
}