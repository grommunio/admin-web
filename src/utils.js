// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import moment from "moment";
import store from './store';

/**
 * Converts object to array of { key, value } objects
 * @param {Object} obj 
 * @returns 
 */
export function objectToArray(obj) {
  const arr = [];
  Object.entries(obj).forEach(([key, value]) => arr.push({ key, value }));
  return arr;
}

/**
 * Converts array of { key, value } objects to object
 * @param {Object} obj 
 * @returns 
 */
export function arrayToObject(arr) {
  const obj = {};
  arr.forEach(attr => obj[attr.key] = attr.value);
  return obj;
}

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


export function getChipColorFromScore(score) {
  if(score >= 100) return "#66bb6a";
  if(score >= 80) return "#29b6f6";
  if(score >= 50) return "#ffa726";
  return "#d32f2f";
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
export const getAutocompleteOptions = (filterAttribute, magnitude) => (options, state) => {
  const { inputValue } = state;
  if(magnitude === undefined) magnitude = Math.round(Math.log10(options.length) - 2);

  return inputValue.length < magnitude ? []
    : options.filter(o => {
      let compareValue = o[filterAttribute];
      if(typeof compareValue === 'string') compareValue = compareValue.toLowerCase();
      return compareValue?.includes(inputValue.toLowerCase());
    });
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
    { key: 'ca-ES', value: 'ca_ES: català' },
    { key: 'cs-CZ', value: 'cs_CZ: Čeština' },
    { key: 'da-DK', value: 'da_DK: Dansk' },
    { key: 'de-DE', value: 'de_DE: Deutsch' },
    { key: 'en-US', value: 'en_US: English' },
    { key: 'el-GR', value: 'el_GR: Ελληνική' },
    { key: 'es-ES', value: 'es_ES: Español' },
    { key: 'fi-FI', value: 'fi_FI: Suomi' },
    { key: 'fr-FR', value: 'fr_FR: Français' },
    { key: 'hu-HU', value: 'hu_HU: Magyar' },
    { key: 'it-IT', value: 'it_IT: Italiano' },
    { key: 'ja-JP', value: 'ja_JP: 日本語' },
    { key: 'nb-NO', value: 'nb_NO: Norsk (bokmål)'},
    { key: 'nl-NL', value: 'nl_NL: Nederlands' },
    { key: 'pl-PL', value: 'pl_PL: Polski' },
    { key: 'pt-PT', value: 'pt_PT: Português europeu' },
    { key: 'ru-RU', value: 'ru_RU: русский' },
    { key: 'sl-SL', value: 'sl_SL: slovenščina' },
    { key: 'tr-TR', value: 'tr_TR: Türkçe' },
    { key: 'ua-UA', value: 'uk_UA: українська' },
    { key: 'zh-CN', value: 'zh_CN: 中文(简体)' },
    { key: 'zh-TW', value: 'zh_TW: 繁體中文' },
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
  const domain = createParams.domain;

  let user = createParams.user;
  user = {
    ...user,
    ...(user.properties || {}),
  };

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

  /* Calculate sizeUnits (MiB, GiB, TiB) based on KiB value for every quota
    The idea behind this loop is to find the highest devisor of the KiB value (1024^x)
    If the KiB value (quotaLimit) is divisible by, for exampe, 1024 but not by 1024^2, the sizeUnit must be MiB.
  */
  for(let quotaLimit in sizeUnits) {
    if(user[quotaLimit] === undefined) continue;
    user[quotaLimit] = user[quotaLimit] / 1024; // quotas are stored in KiB => Convert to MiB
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

/**
 * Converts user type enum value to human-readable representation
 * @param {Number} status enum value of a user type
 * @returns String representation of the enum
 */
export function getUserTypeString(type) {
  return {
    0: "User",
    1: "Group",
    6: "Contact",
    7: "Room",
    8: "Equipment",
    1073741824: "Shared",
  }[type] || "Unknown"
}

/**
 * Converts task state enum value to human-readable representation
 * @param {Number} status enum value of a task state
 * @returns String representation of the task state
 */
export function getTaskState(state) {
  return {
    0: "Queued",
    1: "Loaded",
    2: "Running",
    3: "Completed",
    4: "Error",
    5: "Cancelled"
  }[state] || "Unknown";
}
