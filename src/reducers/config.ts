// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import { StoredCustomImages } from "@/types/config";
import { SERVER_CONFIG_ERROR, SERVER_CONFIG_SET } from "../actions/types";

export type ConfigState = {
  devMode: boolean;
  loadAntispamData: boolean;
  mailWebAddress: string;
  chatWebAddress: string;
  videoWebAddress: string;
  fileWebAddress: string;
  archiveWebAddress: string;
  rspamdWebAddress: string;
  defaultDarkMode: boolean;
  defaultTheme: string;
  tokenRefreshInterval: number;
  customImages: StoredCustomImages;
  searchAttributes: string[];
  error: boolean;
}

const defaultState: ConfigState = {
  devMode: false,
  loadAntispamData: true,
  mailWebAddress: '',
  chatWebAddress: '',
  videoWebAddress: '',
  fileWebAddress: '',
  archiveWebAddress: '',
  rspamdWebAddress: '',
  defaultDarkMode: false,
  defaultTheme: 'grommunio',
  tokenRefreshInterval: 86400,
  customImages: {
  },
  searchAttributes: [
    'assistant',
    'cn',
    'company',
    'department',
    'departmentNumber',
    'description',
    'displayName',
    'employeeNumber',
    'facsimileTelephoneNumber',
    'gecos',
    'givenName',
    'homePhone',
    'initials',
    'l',
    'mail',
    'mailPrimaryAddress',
    'mobile',
    'name',
    'o',
    'otherFacsimileTelephoneNumber',
    'otherHomePhone',
    'otherTelephone',
    'pager',
    'physicalDeliveryOfficeName',
    'postalAddress',
    'postalCode',
    'postOfficeBox',
    'preferredLanguage',
    'sn',
    'st',
    'streetAddress',
    'telephoneNumber',
    'title',
    'uid',
    'wWWHomePage',
  ],
  error: false,
};

type ConfigAction = {
  type: string;
  data?: Partial<ConfigState>;
  error?: boolean,
}

function configReducer(state: ConfigState = defaultState, action: ConfigAction) {
  switch(action.type) {
  case SERVER_CONFIG_SET:
    return {
      ...state,
      ...action.data,
    };
  case SERVER_CONFIG_ERROR:
    return {
      ...state,
      error: action.error || false,
    };

  default:
    break;
  }
  return state;
}

export default configReducer;
