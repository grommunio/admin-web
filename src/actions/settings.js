// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-present grommunio GmbH

import {
  CHANGE_SETTINGS,
} from './types';

export function changeSettings(field, value) {
  return { type: CHANGE_SETTINGS, field, value };
}