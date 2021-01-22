import { addMiddleware } from 'redux-dynamic-middlewares';
import { createLogger } from 'redux-logger';

export var config = {
  devMode: false,
  mailWebAddress: '',
  chatWebAddress: '',
  videoWebAddress: '',
  fileWebAddress: '',
  archiveWebAddress: '',
  searchAttributes: [
    'assistant',
    'co',
    'company',
    'department',
    'departmentNumber',
    'description',
    'displayname',
    'employeeNumber',
    'facsimileTelephoneNumber',
    'givenName',
    'homePhone',
    'initials',
    'l',
    'mail',
    'mailPrimaryAddress',
    'mobile',
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

fetch('//' + window.location.host + '/config.json')
  .then(response => response.json())
  .then(res => {
    if (res) {
      setConfig({ ...res });
      if(res.devMode) {
        addMiddleware(createLogger());
      }
    }
  });

export default config;