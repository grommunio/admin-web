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
