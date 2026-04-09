// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import moment, { Moment } from "moment";
import store from './store';
import { ANSI_CODE_TO_JSS_CLASS } from "./constants";

import { KeyValuePair } from "@/types/common";
import { SyncPolicy } from './types/sync';

/**
 * Converts object to array of { key, value } objects
 */
export function objectToArray<T>(obj: Record<string, T>): KeyValuePair<T>[] {
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}


/**
 * Converts array of { key, value } objects to object
*/
export function arrayToObject<T>(arr: KeyValuePair<T>[]) {
  const obj: Record<string, T> = {};
  arr.forEach(attr => obj[attr.key] = attr.value);
  return obj;
}

/**
 * Parses URL parameters and returns them as object
 * 
 * @param {String} s delay in milliseconds (default: 100)
 * @returns key-value pairs of url parameters
 */
export function parseParams(s: string): Record<string, string> {
  if (!s) {
    return {};
  }
  const segments = s.split('&');
  const data: Record<string, string> = {};
  for (let i = 0; i < segments.length; i++) {
    const parts = segments[i].split('=');
    if (parts.length < 2) {
      parts.push('');
    }
    data[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return data;
}

/**
 * Inserts item at the front of an array
 */
export function addItem<T>(arr: T[], item: T): T[] {
  const copy = [...arr];
  copy.unshift(item);
  return copy;
}

export function findById<T extends { ID: number }>(arr: T[], ID: number): T | undefined {
  return arr.find(item => item.ID === ID)
}

/**
 * Returns the string after the last '/' in the current URL
 * 
 * @returns {String} The string after the last `/` in the current URL
 */
export function getChipColorFromScore(score: number): string {
  if(score >= 100) return "#66bb6a";
  if(score >= 80) return "#29b6f6";
  if(score >= 50) return "#ffa726";
  return "#d32f2f";
}


export function getStringAfterLastSlash(): string {
  return /[^/]*$/.exec(window.location.href)?.[0] || "";
}

/**
 * Formats a date of format `YYYY-MM-DD hh:mm` into the date-time format of the selected language (in settings)
 */
export function setDateTimeString(date: string | Moment | null) {
  return moment(date, "YYYY-MM-DD hh:mm")
    .locale(store.getState().settings.language.slice(0, 2)).format('lll');
}

/**
 * Formats a date of format `YYYY-MM-DD` into the date format of the selected language (in settings)
 */
export function setDateString(date: string | Moment) {
  return moment(date, "YYYY-MM-DD")
    .locale(store.getState().settings.language.slice(0, 2)).format('ll');
}


/**
 * Formats a unixtime into a readable format
 */
export function parseUnixtime(time: number): string {
  const parsedTime = moment.unix(time);
  return store.getState().settings.language === 'de-DE' ?
    parsedTime.format('DD.MM.YYYY HH:mm:ss') :
    parsedTime.format('MM-DD-YYYY h:mm:ss a');
}

/**
 * Calculates the time difference in milliseconds between `time` and `now()`
 */
export function getTimeDiff(time: number): number {
  if(!time) return 0;
  return moment().unix() - time;
}

/**
 * Formats a time difference in milliseconds into a readable format
 */
export function getTimePast(diff: number): string {
  if(diff === null || diff === undefined) return "Unknown";
  
  const duration = moment.duration(diff * 1000);
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  return `${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`;
}

/**
 * Concatenates 2 arrays
 */
export function append<T>(arr: T[], newArr: T[]): T[] {
  return arr.concat(newArr);
}

/**
 * Creates a deep copy of an object
 */
export function cloneObject<T>(obj: T): T {
  const clone = {} as T;

  for (const key in obj) {
    const value = obj[key];

    if (value != null && typeof value === "object") {
      clone[key] = cloneObject(value);
    } else {
      clone[key] = value;
    }
  }

  return clone;
}

/**
 * Converts MDM command code to command name
 */
export function getStringFromCommand(command: number): string {
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

// TODO: Properly type
/**
 * Compares 2 sync policies and returns the different key-value pairs
 */
export function getPolicyDiff(defaultPolicy: Partial<SyncPolicy>, syncPolicy: Partial<SyncPolicy>): Partial<SyncPolicy> {
  const formattedPolicy: Partial<SyncPolicy> = {
    ...syncPolicy,
    devpwhistory: syncPolicy.devpwhistory || 0,
    devpwexpiration: syncPolicy.devpwexpiration || 0,
    maxinacttimedevlock: syncPolicy.maxinacttimedevlock || 0,
  };
  const result: Record<string, any> = {};
  for(const [key, value] of Object.entries(defaultPolicy)) {
    if (formattedPolicy[key as keyof SyncPolicy] !== value) {
      result[key] = formattedPolicy[key as keyof SyncPolicy];
    }
  }
  if (formattedPolicy.approvedapplist?.toString() === defaultPolicy.approvedapplist?.toString()) {
    result.approvedapplist = undefined;
  }
  if (formattedPolicy?.unapprovedinromapplist?.toString() === defaultPolicy?.unapprovedinromapplist?.toString()) {
    result.unapprovedinromapplist = undefined;
  }
  return result;
}

/**
 * Capitalizes first letter of string
 */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Important function for efficiency.
 * The more elements are available for an autocomplete, the more list elements react has to render.
 * This can get very laggy and slow.
 * To prevent that, the necessary input length, before suggestions are shown is calculated
 * in this function (`magnitude`).
 */
export function getAutocompleteOptions<T>(
  filterAttribute?: keyof T,
  magnitude?: number
) {
  return (options: T[], state: { inputValue: string }): T[] => {
    const { inputValue } = state;

    if (magnitude === undefined) {
      magnitude = Math.round(Math.log10(options.length) - 2);
    }

    return inputValue.length < magnitude
      ? []
      : options.filter(o => {
        let compareValue = (filterAttribute ? o[filterAttribute] : o) as string;

        if (typeof compareValue === "string") {
          compareValue = compareValue.toLowerCase();
        }

        return compareValue?.includes(inputValue.toLowerCase());
      });
  };
}

/**
 * Copies a text into the clipboard
 */
export async function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}

/**
 * Returns the available languages
 */
export function getLangs(): KeyValuePair<string>[] {
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

// TODO: Properly type
/**
 * Returns a formatted default create parameters object
 */
export function formatCreateParams(createParams: Record<string, any>) {
  if(!createParams) return {};
  const domain = createParams.domain;

  let user = createParams.user;
  user = {
    ...user,
    ...(user.properties || {}),
  };

  const sizeUnits = {
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
  for(const quotaLimit in sizeUnits) {
    if(user[quotaLimit] === undefined) continue;
    user[quotaLimit] = user[quotaLimit] / 1024; // quotas are stored in KiB => Convert to MiB
    for(let i = 2; i >= 0; i--) {
      if(user[quotaLimit] === 0) break;
      const r = user[quotaLimit] % 1024 ** i;
      if(r === 0) {
        sizeUnits[quotaLimit as keyof typeof sizeUnits] = i + 1;
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

export function generatePropFilterString(filters: Record<string, string | number | number[] | string[]>): string {
  return Object.entries(filters).map(([key, value]) => `${key}:${value}`).join(";");
}

/**
 * Converts user type enum value to human-readable representation
 */
export function getUserTypeString(type?: number): string {
  if(type == null) return "Unknown";
  return {
    0: "User",
    1: "Group",
    6: "Contact",
    7: "Room",
    8: "Equipment",
    1073741824: "Shared",
  }[type] || "Unknown";
}

/**
 * Converts task state enum value to human-readable representation
 */
export function getTaskState(state: number): string {
  return {
    0: "Queued",
    1: "Loaded",
    2: "Running",
    3: "Completed",
    4: "Error",
    5: "Cancelled"
  }[state] || "Unknown";
}

export function validateAltname(s=""): boolean {
  if(!s) return true;
  if (s.length > 64)
    return false;
  // eslint-disable-next-line no-control-regex
  const r1 = /^[-A-Za-z0-9.!#$%&'^_`{}~]+$/;
  const r2 = /(^\.|\.$|\.\.)/;
  return Boolean(s.match(r1) && !s.match(r2));
}

export function dayTimeFromUnix(unixT: number): string {
  return moment.unix(unixT).format("HH:mm:ss");
}

export function dateTimeFromUnix(unixT: number): string {
  return moment.unix(unixT).format("YYYY-MM-DD");
}

export const generateFormattedLogLine = (message: string) => {
  const parts = message.split("\u001b")
  
  // No formatting detected
  if(parts.length === 1) return message;

  const paragraphs = parts.map((part, idx) => {
    // First part is always empty or plain message
    if(idx === 0) return part;

    // Outside formatting scope
    if(idx % 0) {
      // Cut "[0m"
      return part.slice(3);
    }

    // Get formatting
    const ansiEndIndex = part.search("m");
    const formatting = part.slice(1, ansiEndIndex);
    const formattingClass = ANSI_CODE_TO_JSS_CLASS[formatting as keyof typeof ANSI_CODE_TO_JSS_CLASS] || { color: "#888" }

    const plainMessage = part.slice(ansiEndIndex + 1);

    return <p
      key={idx}
      style={{ margin: 0, display: "inline", ...formattingClass }}
    >
      {plainMessage}
    </p>;
  });


  return paragraphs;
}
