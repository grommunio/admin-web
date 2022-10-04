// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import { addMiddleware } from 'redux-dynamic-middlewares';
import { createLogger } from 'redux-logger';

// Default configuration
// Merged with config.json from server
export var config = {
  devMode: false,
  loadAntispamData: true,
  mailWebAddress: '',
  chatWebAddress: '',
  videoWebAddress: '',
  fileWebAddress: '',
  archiveWebAddress: '',
  rspamdWebAddress: '',
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

var setConfig = (newConfig) => {
  config = {
    ...config,
    ...newConfig,
  };
};

// Fetch config.js on server and merge with default config
fetch('//' + window.location.host + '/config.json')
  .then(response => response.json())
  .catch(err => console.error(err))
  .then(res => {
    if (res) {
      setConfig({ ...res });
      // Enable redux logger if devMode is true
      if(res.devMode) {
        addMiddleware(createLogger());
      }
    }
  });


export default config;