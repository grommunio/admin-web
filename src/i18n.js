import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  "en-US": {
    translation: {
      "addHeadline": "Add {{item}}",
      "editHeadline": "Edit {{item}}",
    },
  },
  "de-DE": {
    translation: {
      "addHeadline": "{{item}} hinzufügen",
      "editHeadline": "{{item}} bearbeiten",
      "Add": "Hinzufügen",
      "Configuration": "Konfiguration",
      "Admin": "Admin",
      "User": "Benutzer",
      "Users": "Benutzer",
      "Folder": "Ordner",
      "Folders": "Ordner",
      "Address": "Adresse",
      "Title": "Titel",
      "Maximum space": "Maximaler Speicher",
      "Maximum users": "Maximale Nutzer",
      "Maximum files": "Maximale Dateien",
      "Used space": "Belegter Speicher",
      "User number": "Benutzer Anzahl",
      "Domain number": "Domain Anzahl",
      "Mail addresses": "Mail Adressen",
      "Data area": "Datenbereich",
      "Data areas": "Datenbereiche",
      "Data type": "Datentyp",
      "Master data area": "Master Datenbereich",
      "Accelerated storage area": "Beschleundigter Datenbereich",
      "Slave data area": "Slave Datenbereich",
      "Master user data area": "Master Nutzer Datenbereich",
      "Slave user data area": "Slave Nutzer Datenbereich",
      "Master domain data area": "Master Domain Datenbereich",
      "Slave domain data area": "Slave Domain Datenbereich",
      "Domain list": "Domainliste",
      "Domain": "Domain",
      "Domains": "Domains",
      "Domain type": "Domaintype",
      "Status": "Status",
      "Administrator": "Administrator",
      "Telephone": "Telefon",
      "Mail archive": "Mail Archiv",
      "Mail monitor": "Mail Überwachung",
      "Ignore checking user": "Benutzerprüfung ignorieren",
      "Mail sub system": "Mail Untersystem",
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
      "New password": "Neues Passwort",
      "Old password": "Altes Passwort",
      "Repeat password": "Passwort wiederholen",
      "Save": "Speichern",
      "Back": "Zurück",
      "Cancel": "Abbrechen",
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