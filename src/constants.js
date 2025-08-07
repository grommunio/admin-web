// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

export const DOMAIN_ADMIN_WRITE = 'DomainAdminWrite';
export const DOMAIN_ADMIN_READ = 'DomainAdminRead';
export const SYSTEM_ADMIN_READ = 'SystemAdminRead';
export const SYSTEM_ADMIN_WRITE = 'SystemAdminWrite';
export const DOMAIN_PURGE = 'DomainPurge';
export const ORG_ADMIN = 'OrgAdmin';
export const IPM_SUBTREE_ID = "144115188075855873";
export const IPM_SUBTREE_OBJECT = {
  folderid: IPM_SUBTREE_ID,
  displayname: 'Public Folders',
  comment: 'All Public Folders (root)',
  container: '',
  creationtime: null,
};
export const defaultFetchLimit = 50;
export const USER_STATUS = {  // pseudo enum
  "NORMAL": 0,
  "DEACTIVATED": 1,
  "DELETED": 3,
  "SHARED": 4,
  "CONTACT": 5,
}

export const selectableUserStatuses = [
  { name: 'Normal', ID: USER_STATUS.NORMAL },
  { name: 'Deactivated', ID: USER_STATUS.DEACTIVATED },
  { name: 'Shared', ID: USER_STATUS.SHARED },
];

export const USER_TYPE = {
  "USER": 0,
  "GROUP": 1,  // Deprecated
  "ROOM": 7,
  "EQUIPMENT": 8,
}

export const userTypes = [
  { name: 'User', ID: USER_TYPE.USER },
  { name: 'Room', ID: USER_TYPE.ROOM },
  { name: 'Equipment', ID: USER_TYPE.EQUIPMENT },
];

export const DOMAIN_STATUS = {  // pseudo enum
  "ACTIVATED": 0,
  "DEACTIVATED": 3,
}

export const domainStatuses = [
  { name: 'Activated', ID: DOMAIN_STATUS.ACTIVATED },
  { name: 'Deactivated', ID: DOMAIN_STATUS.DEACTIVATED },
];

export const LIST_PRIVILEGE = {
  "ALL": 0,
  "INTERNAL": 1,
  "DOMAIN": 2,
  "SPECIFIC": 3,
  "OUTGOING": 4,
}

export const LIST_TYPE = {
  "NORMAL": 0,
  "DOMAIN": 2,
}

export const listTypes = [
  { ID: LIST_TYPE.NORMAL, name: "Normal" },
  { ID: LIST_TYPE.DOMAIN, name: "Domain" },
]

export const folderTypes = [
  { name: 'Mail and post items', ID: 'IPF.Note' },
  { name: 'Contact', ID: 'IPF.Contact' },
  { name: 'Appointment', ID: 'IPF.Appointment' },
  { name: 'Sticky note', ID: 'IPF.Stickynote' },
  { name: 'Task', ID: 'IPF.Task' },
]

export const ANSI_CODE_TO_JSS_CLASS = {
  "0;30": {},
  "0;31": { color: "red" },
  "0;32": { color: "green" },
  "0;33": { color: "yellow" },
  "0;34": { color: "blue" },
  "0;35": { color: "purple" },
  "0;36": { color: "cyan" },
  "0;37": {},

  "1;30": { fontWeight: "bold" },
  "1;31": { fontWeight: "bold", color: "red" },
  "1;32": { fontWeight: "bold", color: "green" },
  "1;33": { fontWeight: "bold", color: "yellow" },
  "1;34": { fontWeight: "bold", color: "blue" },
  "1;35": { fontWeight: "bold", color: "purple" },
  "1;36": { fontWeight: "bold", color: "cyan" },
  "1;37": { fontWeight: "bold" },

  "4;30": { textDecoration: "underline" },
  "4;31": { textDecoration: "underline", color: "red" },
  "4;32": { textDecoration: "underline", color: "green" },
  "4;33": { textDecoration: "underline", color: "yellow" },
  "4;34": { textDecoration: "underline", color: "blue" },
  "4;35": { textDecoration: "underline", color: "purple" },
  "4;36": { textDecoration: "underline", color: "cyan" },
  "4;37": { textDecoration: "underline" },

  "40": { backgroundColor: "black", color: "white" },
  "41": { backgroundColor: "red", color: "black" },
  "42": { backgroundColor: "green", color: "black" },
  "43": { backgroundColor: "yellow", color: "black" },
  "44": { backgroundColor: "blue", color: "black" },
  "45": { backgroundColor: "purple", color: "black" },
  "46": { backgroundColor: "cyan", color: "black" },
  "47": { backgroundColor: "white", color: "black" },
};

// Options used by the global search textfield
export const globalSearchOptions = [
  {
    label: 'Users',
    tags: ['users'],
    route: '/users'
  },
  {
    label: 'Domains',
    tags: ['domains'],
    route: '/domains'
  },
  {
    label: 'Roles',
    tags: ['roles'],
    route: '/roles'
  },
  {
    label: 'Organizations',
    tags: ['orgs', 'organizations'],
    route: '/orgs'
  },
  {
    label: 'Dashboard',
    tags: ['menu', 'dashboard'],
    route: '/'
  },
  {
    label: 'Defaults',
    tags: ['defaults'],
    route: '/defaults'
  },
  {
    label: 'LDAP Directory',
    tags: ['ldap', 'directory', 'import', 'server', 'configuration', 'configure'],
    route: '/directory'
  },
  {
    label: 'Configuration DB',
    tags: ['dbconf', 'db', 'database', 'configuration', 'files', 'services'],
    route: '/dbconf'
  },
  {
    label: 'Servers',
    tags: ['servers', 'hostname', 'external name'],
    route: '/servers'
  },
  {
    label: 'Logging',
    tags: ['logs', 'logging', 'services'],
    route: '/logs'
  },
  {
    label: 'Mail queue',
    tags: ["mailq", "email queue",'mail queue', 'postfix', 'gromox'],
    route: '/mailq'
  },
  {
    label: 'Task queue',
    tags: ["taskq", "tasks", "task queue", 'pending', "queue"],
    route: '/taskq'
  },
  {
    label: 'Mobile Devices',
    tags: ["sync", "synchronization", "states", 'mobiles', "mobile devices", "push connections"],
    route: '/sync'
  },
  {
    label: 'Live status',
    tags: ["live status", 'monitor', "connections", "requests", "host details"],
    route: '/status'
  },
  {
    label: 'Settings',
    tags: ["settings", "lightmode", "darkmode"],
    route: '/settings'
  },
  {
    label: 'Design',
    tags: ["design", "white", "label", "whitelabel"],
    route: '/license'
  },
  {
    label: 'Updates',
    tags: ["updates", "update", "upgrade"],
    route: '/license'
  },
  {
    label: 'License',
    tags: ["license", "product", "upload"],
    route: '/license'
  }
]