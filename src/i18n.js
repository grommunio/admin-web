import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  "en-US": {
    translation: {
    },
  },
  "de-DE": {
    translation: {
      "Configuration": "Konfiguration",
      "User": "Benutzer",
      "Users": "Benutzer",
      "Folder": "Ordner",
      "Folders": "Ordner",
      "Mail addresses": "Mail Adressen",
      "Data area": "Datenbereich",
      "Data areas": "Datenbereiche",
      "Domain list": "Domainliste",
      "Base setup": "Basis Konfiguration",
      "Default data": "Basisdaten",
      "Group": "Gruppe",
      "Groups": "Gruppen",
      "Organization": "Organisation",
      "Organizations": "Organisationen",
      "Alias": "Pseudonym",
      "Aliases": "Pseudonyme",
      "Forward": "Weiterleitung",
      "Forwards": "Weiterleitungen",
      "Mail lists": "Mail Listen",
      "Class": "Klasse",
      "Classes": "Klassen",
      "Member": "Mitglied",
      "Members": "Mitglieder",
      "Settings": "Einstellungen",
      "Change password": "Passwort ändern",
      "Logout": "Ausloggen",
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