// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  PROFILE_DATA_RECEIVED,
} from '../actions/types';
import { profile } from '../api';
import { defaultListHandler } from './handlers';

export function fetchProfileData() {
  return defaultListHandler(profile, PROFILE_DATA_RECEIVED);
}
