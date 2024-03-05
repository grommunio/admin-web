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
    label: 'Sync',
    tags: ["synchronization", "states", 'mobiles', "mobile devices", "push connections"],
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
    label: 'License',
    tags: ["license", "product", "upload"],
    route: '/settings'
  }
]