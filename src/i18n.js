import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  "en-US": {
    translation: {
    },
  },
  "de-DE": {
    translation: {
    },
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