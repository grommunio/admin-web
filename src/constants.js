export const DOMAIN_ADMIN_WRITE = 'DomainAdminWrite';
export const SYSTEM_ADMIN_READ = 'SystemAdminRead';
export const SYSTEM_ADMIN_WRITE = 'SystemAdminWrite';
export const DOMAIN_PURGE = 'DomainPurge';
export const ORG_ADMIN = 'OrgAdmin';
export const IPM_SUBTREE_ID = "144115188075855873";
export const IPM_SUBTREE_OBJECT = {
  folderid: IPM_SUBTREE_ID,
  displayname: 'IPM_SUBTREE',
  comment: 'All Public Folders (root)',
  container: '',
  creationtime: null,
};
export const defaultFetchLimit = 50;

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
    label: 'license',
    tags: ["license", "product", "upload"],
    route: '/settings'
  }
]