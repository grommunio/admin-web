// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import {
  DASHBOARD_DATA_RECEIVED,
} from '../actions/types';
import { dashboard } from '../api';
import { defaultListHandler } from './handlers';

export function fetchDashboardData() {
  return defaultListHandler(dashboard, DASHBOARD_DATA_RECEIVED);
}
