// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import moment from "moment";
import store from './store';

/**
 * Creates a timeout of `delay` milliseconds
 * 
 * @param {Number} delay delay in milliseconds (default: 100)
 * @returns {Promise} Promise to be resolved after `delay` milliseconds
 */
export function later(delay) {
  if (!delay) {
    delay = 100;
  }

  return new Promise(function(resolve) {
    setTimeout(resolve, delay);
  });
}

/**
 * Parses URL parameters and returns them as object
 * 
 * @param {String} s delay in milliseconds (default: 100)
 * @returns {Object} key-value pairs of url parameters
 */
export function parseParams(s) {
  if (!s) {
    return {};
  }
  let segments = s.split('&');
  let data = {};
  let parts;
  for (let i = 0; i < segments.length; i++) {
    parts = segments[i].split('=');
    if (parts.length < 2) {
      parts.push('');
    }
    data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return data;
}

/**
 * Pushes an item into an array
 * 
 * @param {Array} arr array to push into
 * @param {any} item element to push into array
 * @returns {Array} `[...arr, item]`
 */
export function addItem(arr, item) {
  const copy = [...arr];
  copy.push(item);
  return copy;
}


/**
 * Returns the string after the last '/' in the current URL
 * 
 * @returns {String} The string after the last `/` in the current URL
 */
export function getStringAfterLastSlash() {
  return /[^/]*$/.exec(window.location.href)[0];
}

/**
 * Returns the current domain-id in the URL
 * 
 * @returns {number} the current domain-id in the URL
 */
export function getDomainFromUrl() {
  const first = window.location.pathname;
  first.indexOf(1);
  first.toLowerCase();
  return parseInt(first.split("/")[1]);
}

/**
 * Formats a date of format `YYYY-MM-DD hh:mm` into the date-time format of the selected language (in settings)
 * 
 * @param {Date} date date to be formatted into common format
 * @returns {String} formatted date
 */
export function setDateTimeString(date) {
  return moment(date, "YYYY-MM-DD hh:mm")
    .locale(store.getState().settings.language.slice(0, 2)).format('lll');
}

/**
 * Formats a date of format `YYYY-MM-DD` into the date format of the selected language (in settings)
 * 
 * @param {Date} date date to be formatted into common format
 * @returns {String} formatted date
 */
export function setDateString(date) {
  return moment(date, "YYYY-MM-DD")
    .locale(store.getState().settings.language.slice(0, 2)).format('ll');
}


/**
 * Formats a unixtime into a readable format
 * 
 * @param {number} time unixtime to be formatted
 * @returns {String} formatted unixtime (date)
 */
export function parseUnixtime(time) {
  const parsedTime = moment.unix(time);
  return store.getState().settings.language === 'de-DE' ?
    parsedTime.format('DD.MM.YYYY HH:mm:ss') :
    parsedTime.format('MM-DD-YYYY h:mm:ss a');
}

/**
 * Calculates the time difference in milliseconds between `time` and `now()`
 * 
 * @param {number} time unixtime to compare current time to
 * @returns {number} time difference in milliseconds
 */
export function getTimeDiff(time) {
  if(!time) return 0;
  return moment().unix() - time;
}

/**
 * Formats a timedifference in milliseconds into a readable format
 * 
 * @param {number} diff unix time difference
 * @returns {String} formatted time difference
 */
export function getTimePast(diff) {
  if(diff === null || diff === undefined) return "Unknown";
  
  const duration = moment.duration(diff * 1000);
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  return `${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`;
}

/**
 * Concatenates 2 arrays
 * 
 * @param {Array} arr first array
 * @param {Array} newArr second array
 * @returns {String} concatenation of `arr` and `newArr`
 */
export function append(arr, newArr) {
  let copy = [...arr];
  copy = copy.concat(newArr);
  return copy;
}

/**
 * Creates a deep copy of an object
 * 
 * @param {Object} obj the object to copy
 * @returns {Object} A deep copy of `obj`
 */
export function cloneObject(obj) {
  var clone = {};
  for(var i in obj) {
    if(obj[i] != null &&  typeof(obj[i])=="object")
      clone[i] = cloneObject(obj[i]);
    else
      clone[i] = obj[i];
  }
  return clone;
}

/**
 * Converts MDM command code to command name
 * 
 * @param {number} command command to parse
 * @returns {String} Command name
 */
export function getStringFromCommand(command) {
  switch (command) {
    case 0: return 'Sync';
    case 1: return 'SendMail';
    case 2: return 'SmartForward';
    case 3: return 'SmartReply';
    case 4: return 'GetAttachment';
    case 9: return 'FolderSync';
    case 10: return 'FolderCreate';
    case 11: return 'FolderDelete';
    case 12: return 'FolderUpdate';
    case 13: return 'MoveItems';
    case 14: return 'GetItemEstimate';
    case 15: return 'MeetingResponse';
    case 16: return 'Search';
    case 17: return 'Settings';
    case 18: return 'Ping';
    case 19: return 'ItemOperations';
    case 20: return 'Provision';
    case 21: return 'ResolveRecipients';
    case 22: return 'ValidateCert';

    case -1: return 'GetHierarchy';
    case -2: return 'CreateCollection';
    case -3: return 'DeleteCollection';
    case -4: return 'MoveCollection';
    case -5: return 'Notify';

    case -100: return 'WebserviceDevice';
    case -101: return 'WebserviceUsers';
    case -102: return 'WebserviceInfo';
    default: return '';
  }
}

/**
 * Compares 2 sync policies and returns the different key-value pairs
 * 
 * @param {Object} defaultPolicy The default policy to compare to
 * @param {Object} syncPolicy the current policy of a domain or user
 * @returns {Object} Difference between the two policies
 */
export function getPolicyDiff(defaultPolicy, syncPolicy) {
  const formattedPolicy = {
    ...syncPolicy,
    devpwhistory: parseInt(syncPolicy.devpwhistory) || 0,
    devpwexpiration: parseInt(syncPolicy.devpwexpiration) || 0,
    maxinacttimedevlock: parseInt(syncPolicy.maxinacttimedevlock) || 0,
  };
  const result = {};
  for(const [key, value] of Object.entries(defaultPolicy)) {
    if (formattedPolicy[key] !== value) {
      result[key] = formattedPolicy[key];
    }
  }
  if (formattedPolicy.approvedapplist.toString() === defaultPolicy.approvedapplist.toString()) {
    result.approvedapplist = undefined;
  }
  if (formattedPolicy.unapprovedinromapplist.toString() === defaultPolicy.unapprovedinromapplist.toString()) {
    result.unapprovedinromapplist = undefined;
  }
  return result;
}

/**
 * Capitalizes first letter of string
 * 
 * @param {String} string string to change
 * @returns {String} Changed string
 */
export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Important function for efficiency.
 * The more elements are available for an autocomplete, the more list elements react has to render.
 * This can get very laggy and slow.
 * To prevent that, the necessary input length, before suggestions are shown is calculated
 * in this function (`magnitude`).
 * 
 * @param {String} filterAttribute attribute of an object (within an array of objects) to compare the input value to
 * @param {Array} options array of objects/options for the autocomplete (internal)
 * @param {Object} state state of the input (internal)
 * @returns {Array} Autocomplete options to be displayed
 */
export const getAutocompleteOptions = filterAttribute => (options, state) => {
  const { inputValue } = state;
  const magnitude = Math.round(Math.log10(options.length) - 2);

  return inputValue.length < magnitude ? []
    : options.filter(o => o[filterAttribute]?.includes(inputValue.toLowerCase()));
};

/**
 * Copies a text into the clipboard
 * 
 * @param {String} text string to copy
 */
export async function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}

/**
 * Returns the available languages
 * 
 * @returns {Array} array of language objects
 */
export function getLangs() {
  return [
    { key: 'en-US', value: 'English' },
    { key: 'de-DE', value: 'German' },
    { key: 'ar-DZ', value: 'Arabic (Algeria)' },
    { key: 'ar-SA', value: 'Arabic (Saudi Arabia)' },
    { key: 'ca-CA', value: 'Catalan' },
    { key: 'zh-CN', value: 'Chinese (Simplified)' },
    { key: 'zh-TW', value: 'Chinese (Taiwan)' },
    { key: 'hr-HR', value: 'Croatian' },
    { key: 'cs-CS', value: 'Czech' },
    { key: 'da-DA', value: 'Danish' },
    { key: 'nl-NL', value: 'Dutch' },
    { key: 'et-ET', value: 'Estonian' },
    { key: 'de-CH', value: 'German (Switzerland)' },
    { key: 'fi-FI', value: 'Finnish' },
    { key: 'fr-FR', value: 'French' },
    { key: 'he-HE', value: 'Hebrew' },
    { key: 'hu-HU', value: 'Hungarian' },
    { key: 'is-IS', value: 'Icelandic' },
    { key: 'it-IT', value: 'Italian' },
    { key: 'ja-JA', value: 'Japanese' },
    { key: 'ko-KO', value: 'Korean' },
    { key: 'nb-NB', value: 'Norwegian (Bokmål)'},
    { key: 'fa-IR', value: 'Persian' },
    { key: 'pl-PL', value: 'Polish' },
    { key: 'pt-BR', value: 'Portuguese (Brazil)' },
    { key: 'pt-PT', value: 'Portuguese (Portugal)' },
    { key: 'ru-RU', value: 'Russian' },
    { key: 'sl-SL', value: 'Slovenian' },
    { key: 'es-ES', value: 'Spanish' },
    { key: 'tr-TR', value: 'Turkish' },
    { key: 'ua-UA', value: 'Ukrainian' },
  ];
}

/**
 * Returns a formatted default create parameters object
 * 
 * @param {Object} createParams raw create parameters
 * @returns {Array} array of language objects
 */
export function formatCreateParams(createParams) {
  if(!createParams) return {};
  const user = createParams.user;
  const domain = createParams.domain;
  let sizeUnits = {
    storagequotalimit: 1,
    prohibitreceivequota: 1,
    prohibitsendquota: 1,
  };
  if(user.chat) {
    user.chatUser = user.chat;
    delete user.chat;
  }
  if(domain.chat) {
    domain.chatTeam = domain.chat;
    delete domain.chat;
  }
  for(let quotaLimit in sizeUnits) {
    if(user[quotaLimit] === undefined) continue;
    user[quotaLimit] = user[quotaLimit] / 1024;
    for(let i = 2; i >= 0; i--) {
      if(user[quotaLimit] === 0) break;
      let r = user[quotaLimit] % 1024 ** i;
      if(r === 0) {
        sizeUnits[quotaLimit] = i + 1;
        user[quotaLimit] = user[quotaLimit] / 1024 ** i;
        break;
      }
    }
    user[quotaLimit] = Math.ceil(user[quotaLimit]);
  }
  return {
    sizeUnits,
    createParams: {
      ...user,
      ...domain,
    },
  };
}
