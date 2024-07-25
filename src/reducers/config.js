// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import { SERVER_CONFIG_SET } from "../actions/types";

const defaultState = {
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
    //localhost: {
    //  logo: 'https://pbs.twimg.com/media/Edv4Ne2XYAA-Vem.jpg',
    //  logoLight: 'https://pbs.twimg.com/media/Edv4Ne2XYAA-Vem.jpg',
    //  icon: 'https://pbs.twimg.com/media/Edv4Ne2XYAA-Vem.jpg',
    //  background: 'https://pbs.twimg.com/media/Edv4Ne2XYAA-Vem.jpg',
    //  backgroundDark: 'https://pbs.twimg.com/media/Edv4Ne2XYAA-Vem.jpg',
    //},
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
};

function configReducer(state = defaultState, action) {
  switch(action.type) {
  case SERVER_CONFIG_SET:
    return {
      ...state,
      ...action.data,
    };

  default:
    break;
  }
  return state;
}

export default configReducer;
