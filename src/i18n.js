// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2021 grommunio GmbH

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './i18n/de-DE.json';
import en from './i18n/en-US.json';

const resources = {
  "en-US": {
    translation: en,
  },
  "de-DE": {
    translation: de,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en-US',
    fallbackLng: 'en-US',
    debug: false, 
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });


export default i18n;
