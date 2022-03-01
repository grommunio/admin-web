// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arDZ from './i18n/ar-DZ.json';
import arSA from './i18n/ar-SA.json';
import ca from './i18n/ca-CA.json';
import cs from './i18n/cs-CS.json';
import da from './i18n/da-DA.json';
import deCH from './i18n/de-CH.json';
import de from './i18n/de-DE.json';
import en from './i18n/en-US.json';
import es from './i18n/es-ES.json';
import et from './i18n/et-ET.json';
import fa from './i18n/fa-IR.json';
import fi from './i18n/fi-FI.json';
import fr from './i18n/fr-FR.json';
import he from './i18n/he-HE.json';
import hr from './i18n/hr-HR.json';
import hu from './i18n/hu-HU.json';
import is from './i18n/is-IS.json';
import it from './i18n/it-IT.json';
import ja from './i18n/ja-JA.json';
import ko from './i18n/ko-KO.json';
import nb from './i18n/nb-NB.json';
import nl from './i18n/nl-NL.json';
import pl from './i18n/pl-PL.json';
import ptBR from './i18n/pt-BR.json';
import pt from './i18n/pt-PT.json';
import ru from './i18n/ru-RU.json';
import sl from './i18n/sl-SL.json';
import tr from './i18n/tr-TR.json';
import ua from './i18n/ua-UA.json';
import zhCN from './i18n/zh-CN.json';
import zhTW from './i18n/zh-TW.json';

const resources = {
  "ar-DZ": {
    translation: arDZ,
  },
  "ar-SA": {
    translation: arSA,
  },
  "ca-CA": {
    translation: ca,
  },
  "cs-CS": {
    translation: cs,
  },
  "da-DA": {
    translation: da,
  },
  "de-CH": {
    translation: deCH,
  },
  "de-DE": {
    translation: de,
  },
  "en-US": {
    translation: en,
  },
  "es-ES": {
    translation: es,
  },
  "et-ET": {
    translation: et,
  },
  "fa-FA": {
    translation: fa,
  },
  "fi-FI": {
    translation: fi,
  },
  "fr-FR": {
    translation: fr,
  },
  "he-HE": {
    translation: he,
  },
  "hr-HR": {
    translation: hr,
  },
  "hu-HU": {
    translation: hu,
  },
  "is-IS": {
    translation: is,
  },
  "it-IT": {
    translation: it,
  },
  "ja-JA": {
    translation: ja,
  },
  "ko-KO": {
    translation: ko,
  },
  "nb-NB": {
    translation: nb,
  },
  "nl-NL": {
    translation: nl,
  },
  "pl-PL": {
    translation: pl,
  },
  "pt-BR": {
    translation: ptBR,
  },
  "pt-PT": {
    translation: pt,
  },
  "ru-RU": {
    translation: ru,
  },
  "sl-SL": {
    translation: sl,
  },
  "tr-TR": {
    translation: tr,
  },
  "ua-UA": {
    translation: ua,
  },
  "zh-CN": {
    translation: zhCN,
  },
  "zh-TW": {
    translation: zhTW,
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
