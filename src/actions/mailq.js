import { mailq } from '../api';
import { defaultDetailsHandler } from './handlers';

export function fetchMailQData() {
  return defaultDetailsHandler(mailq);
}
