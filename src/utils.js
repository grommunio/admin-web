// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import moment from "moment";
import store from './store';

export function later(delay) {
  if (!delay) {
    delay = 100;
  }

  return new Promise(function(resolve) {
    setTimeout(resolve, delay);
  });
}

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

export function addItem(arr, item) {
  const copy = [...arr];
  copy.push(item);
  return copy;
}

export function getStringAfterLastSlash() {
  return /[^/]*$/.exec(window.location.href)[0];
}

export function getDomainFromUrl() {
  const first = window.location.pathname;
  first.indexOf(1);
  first.toLowerCase();
  return parseInt(first.split("/")[1]);
}

export function setDateTimeString(date) {
  return moment(date, "YYYY-MM-DD hh:mm")
    .locale(store.getState().settings.language.slice(0, 2)).format('lll');
}

export function setDateString(date) {
  return moment(date, "YYYY-MM-DD")
    .locale(store.getState().settings.language.slice(0, 2)).format('ll');
}

export function parseUnixtime(time) {
  const parsedTime = moment.unix(time);
  return store.getState().settings.language === 'de-DE' ?
    parsedTime.format('DD.MM.YYYY HH:mm:ss') :
    parsedTime.format('MM-DD-YYYY h:mm:ss a');
}

export function append(arr, newArr) {
  let copy = [...arr];
  copy = copy.concat(newArr);
  return copy;
}

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

