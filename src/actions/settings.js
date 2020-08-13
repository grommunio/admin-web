import {
  CHANGE_SETTINGS,
} from './types';

export function changeSettings(field, value) {
  return { type: CHANGE_SETTINGS, field, value };
}