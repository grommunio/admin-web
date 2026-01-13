// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import {
  ABOUT_DATA_RECEIVED,
} from '../actions/types';
import { about } from '../api';
import { defaultListHandler } from './handlers';

export function fetchAboutData() {
  return defaultListHandler(about, ABOUT_DATA_RECEIVED);
}
