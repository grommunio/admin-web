// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH
import { URLParams } from './actions/types';
import { USER_STATUS } from './constants';
import store from './store';
import { NewDomain, UpdateDomain } from './types/domains';
import { NewFolder, UpdateFolder } from './types/folders';
import { NewGroup, UpdateGroup } from './types/groups';
import { CheckLdapUsersParams, FetchLdapParams, ImportLdapParams, LdapConfigData, LdapDumpParams, SyncLdapParams } from './types/ldap';
import { LogURLParams } from './types/logs';
import { NewOrg, UpdateOrg } from './types/orgs';
import { NewRole, UpdateRole } from './types/roles';
import { NewServer, ServerPolicy, UpdateServer } from './types/servers';
import { FetchSyncParams, RemoteWipeParams } from './types/sync';
import { DeleteOrphanedUsersParams, NewUser, OofSettings, UpdateUser } from './types/users';

const baseUrl = '//' + window.location.host + '/api/v1';

/**
 * Handles fetch api errors
 */
async function handleErrors(response: Response) {
  if (response.ok) {
    return await response.json();
  }
  let resp = '';
  try {
    await response.json().then(json => {
      resp = json.message;
    });
  } catch (err) {
    resp = response.statusText;
  }
  return Promise.reject(new Error(resp));
}

/**
 * Handles fetch api errors (auth only)
 */
async function handleLoginErrors(response: Response) {
  if (response.ok) {
    return await response.json();
  }
  let message = '';
  const status = response.status;
  if(status === 502) {
    return Promise.reject(new Error("Could not connect to backend"));
  }
  try {
    await response.json().then(json => {
      message = json.message;
    });
  } catch (err) {
    message = response.statusText;
  }
  return Promise.reject(new Error(message));
}

/**
 * Sends GET request to rest api
 */
async function get(path: string) {
  return await fetch(baseUrl + path)
    .then(handleErrors);
}

/**
 * Sends PATCH request to rest api
 */
async function patch(path: string, data: Record<string, any>) {
  const csrf = store.getState().auth.csrf;
  return fetch((baseUrl + path), {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrf,
    } as HeadersInit,
  }).then(handleErrors);
}

/**
 * Sends POST request to rest api
 */
async function post(path: string, data?: Record<string, any>) {
  const csrf = store.getState().auth.csrf;
  return await fetch((baseUrl + path), {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrf,
    } as HeadersInit,
  }).then(handleErrors);
}

/**
 * Sends PUT request to rest api
 */
async function put(path: string, data?: Record<string, any>) {
  const csrf = store.getState().auth.csrf;
  return await fetch((baseUrl + path), {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrf,
    } as HeadersInit,
  }).then(handleErrors);
}

/**
 * Sends DELETE request to rest api
 */
async function yeet(path: string) {
  const csrf = store.getState().auth.csrf;
  return await fetch((baseUrl + path), {
    method: 'DELETE',
    headers: {
      'X-CSRF-TOKEN': csrf,
    } as HeadersInit,
  }).then(handleErrors);
}

/**
 * Sends PUT request to rest api (for fileuploads only)
 */
async function uploadPut(path: string, data: BodyInit) {
  const csrf = store.getState().auth.csrf;
  return fetch((baseUrl + path), {
    method: 'PUT',
    body: data,
    headers: {
      'X-CSRF-TOKEN': csrf,
    } as HeadersInit,
  }).then(handleErrors);
}

/**
 * Sends POST request to rest api (for authentication only)
 */
async function loginPost(path: string, data: BodyInit) {
  return await fetch((baseUrl + path), {
    method: 'POST',
    body: data || null,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(handleLoginErrors);
}

/**
 * Sends POST request to rest api to renew a JWT
 */
async function renew() {
  return await fetch((baseUrl + '/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(handleErrors);
}

/**
 * Builds query from endpoint and params
 */
function buildQuery(endpoint: string, params={}) {
  const paramsArray = Object.entries(params);
  if(paramsArray.length === 0) return endpoint;
  const query = endpoint + '?' + paramsArray.reduce((prev, [name, val]) => prev + (val !== undefined ? `${name}=${val}&` : ''), '');
  return query.slice(0, -1);
}

/*
  #################
      ENDPOINTS
  #################
*/

/*
  LOGIN
*/

export async function login(user: string, pass: string) {
  return await loginPost('/login', `user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
}

export async function renewToken() {
  return await renew();
}

export async function profile() {
  return await get('/profile');
}

/*
  DASHBOARD
*/

export function dashboard() {
  return async () => {
    return await get('/system/dashboard');
  };
}

export function services() {
  return async () => {
    return await get('/system/dashboard/services');
  };
}

export function postServices(service: string, action: string) {
  return async () => {
    return await post('/system/dashboard/services/' + service + '/' + action);
  };
}

export function antispam() {
  return async () => {
    return await get('/system/antispam/stat');
  };
}

/*
  SYSTEM UPDATES
*/

export function update(action: string, repo="supported") {
  return async () => {
    return await post(buildQuery('/system/updates/' + action, { repo }));
  };
}

/*
  DOMAINS
*/

export async function drawerDomains() {
  return await get(buildQuery('/domains', { domainType: 0, sort: 'domainname,asc', level: 1, limit: 1000000000 }));
}

export async function domains(params: URLParams={}) {
  return await get(buildQuery('/system/domains', { ...params, domainType: 0 }));
}

export async function domain(id: number) {
  return await get('/system/domains/' + id);
}

export function addDomain(domain: NewDomain, params: URLParams={}) {
  return async () => {
    return await post(buildQuery('/system/domains', params), domain);
  };
}

export function editDomain(domain: UpdateDomain) {
  return async () => {
    return await patch('/system/domains/' + domain.ID, { ...domain, ID: undefined });
  };
}

export function deleteDomain(id: number, params: URLParams={}) {
  return async () => {
    return await yeet(buildQuery('/system/domains/' + id, params));
  };
}

export async function changeDomainPassword(id: number, newPw: string) {
  try {
    return await put('/system/domains/' + id + '/password', { new: newPw });
  } catch(err) { console.error(err); }
}

export async function dns(domainId: number) {
  return await get('/domains/' + domainId + '/dnsCheck');
}

/*
  USERS
*/

export async function allUsers(params: URLParams={}) {
  return await get(buildQuery('/system/users', {
    ...params,
    addressType: 0,
    matchProps: 'displayname',
    properties: 'displayname,displaytypeex',
  }));
}

export async function allContacts(params: URLParams={}) {
  return await get(buildQuery('/system/users', {
    ...params,
    status: USER_STATUS.CONTACT,
    matchProps: 'displayname,smtpaddress',
    properties: 'displayname,smtpaddress',
  }));
}

export async function users(domainID: number, params: URLParams={}) {
  return await get(buildQuery(
    '/domains/' + domainID + '/users', {
      ...params,
      matchProps: 'displayname',
      properties: 'displayname,storagequotalimit,receivequotalimit,messagesizeextended,displaytypeex',
      addressType: 0,
    }));
}

export async function usersPlain(domainID: number, params: URLParams={}) {
  return await get(buildQuery(
    '/domains/' + domainID + '/users', {
      level: 0,
      limit: 1000000,
      sort: 'username,asc',
      ...params,
    }));
}

export function userList() {
  return async () => {
    return await get('/users');
  };
}

export async function contacts(domainID: number, params: URLParams={}) {
  return await get(buildQuery(
    '/domains/' + domainID + '/users', {
      ...params,
      status: USER_STATUS.CONTACT,
      matchProps: 'displayname,smtpaddress',
      properties: 'displayname,smtpaddress',
    }));
}

export async function userCount(domainID: number) {
  return await get(buildQuery('/domains/' + domainID + '/users', { limit: 0, status: USER_STATUS.NORMAL }));
}

export async function user(domainID: number, userID: number) {
  return await get('/domains/' + domainID + '/users/'+ userID);
}

export function addUser(domainID: number, user: NewUser) {
  return async () => {
    return await post('/domains/' + domainID + '/users', user);
  };
}

export function editUser(domainID: number, user: UpdateUser) {
  return async () => {
    return await patch('/domains/' + domainID + '/users/' + user.ID, { ...user, ID: undefined });
  };
}

export function deleteUser(domainID: number, id: number, params: URLParams={}) {
  return async () => {
    return await yeet(buildQuery('/domains/' + domainID + '/users/' + id, params));
  };
}

export async function changeUserPassword(domainID: number, id: number, newPw: string) {
  try {
    return await put('/domains/' + domainID + '/users/' + id + '/password',
      { new: newPw });
  } catch(err) { return Promise.reject(err); }
}

export function editUserRole(domainID: number, userID: number, roles: { roles: number[] }) {
  return async () => {
    return await patch('/domains/' + domainID + '/users/' + userID + '/roles', roles);
  };
}

export function userSync(domainID: number, userID: number) {
  return async () => {
    return await get('/domains/' + domainID + '/users/'+ userID + '/sync');
  };
}

export function removeUserSync(domainID: number, userID: number) {
  return async () => {
    return await yeet('/domains/' + domainID + '/users/'+ userID + '/sync');
  };
}

export function remoteWipeEngage(domainID: number, userID: number, deviceId: string, request: RemoteWipeParams) {
  return async () => {
    return await post('/domains/' + domainID + '/users/'+ userID + '/sync/' + deviceId + '/wipe', request);
  };
}

export function remoteWipeCancel(domainID: number, userID: number, deviceId: string) {
  return async () => {
    return await yeet('/domains/' + domainID + '/users/'+ userID + '/sync/' + deviceId + '/wipe');
  };
}

export function remoteResyncEngage(domainID: number, userID: number, deviceId: string) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/sync/' + deviceId + '/resync');
  };
}

export function remoteDeleteEngage(domainID: number, userID: number, deviceId: string) {
  return async () => {
    return await yeet('/domains/' + domainID + '/users/'+ userID + '/sync/' + deviceId);
  };
}

export function userDelegates(domainID: number, userID: number) {
  return async () => {
    return await get('/domains/' + domainID + '/users/'+ userID + '/delegates');
  };
}

export function editUserDelegates(domainID: number, userID: number, delegates: string[]) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/delegates', delegates);
  };
}

export function userSendAs(domainID: number, userID: number) {
  return async () => {
    return await get('/domains/' + domainID + '/users/'+ userID + '/sendas');
  };
}

export function editUserSendAs(domainID: number, userID: number, sendAs: string[]) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/sendas', sendAs);
  };
}

export function permittedUsers(domainID: number, userID: number, params: URLParams={}) {
  return async () => {
    return await get(buildQuery('/domains/' + domainID + '/users/'+ userID + '/storeAccess', params));
  };
}

export function setPermittedUser(domainID: number, userID: number, permittedUsers: string[]) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/storeAccess', permittedUsers);
  };
}

export function deletePermittedUser(domainID: number, userID: number, id: number) {
  return async () => {
    return await yeet('/domains/' + domainID + '/users/'+ userID + '/storeAccess/' + id);
  };
}

export function userOof(domainID: number, userID: number) {
  return async () => {
    return await get('/domains/' + domainID + '/users/'+ userID + '/oof');
  };
}

export function putUserOof(domainID: number, userID: number, oofSettings: OofSettings) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/oof', oofSettings);
  };
}

/* LDAP */

export function searchLdap(params: FetchLdapParams) {
  return async () => {
    return await get(buildQuery('/domains/ldap/search', { organization: 0, ...params }));
  };
}

export function importUser(params: ImportLdapParams) {
  return async () => {
    return await post(buildQuery('/domains/ldap/importUser', { organization: 0, ...params }));
  };
}

export function sync(domainID: number, userID: number) {
  return async () => {
    return await put('/domains/' + domainID + '/users/' + userID + '/downsync');
  };
}

export async function syncAll(params: SyncLdapParams, domainID: number) {
  return await post(buildQuery('/domains/' + (domainID !== undefined ? domainID + '/' : '')
    + 'ldap/downsync', { ...params }));
}

export function ldapDump(params: LdapDumpParams) {
  return async () => {
    return await get(buildQuery('/domains/ldap/dump', { ...params }));
  };
}

export function checkLdap(params: CheckLdapUsersParams) {
  return async () => {
    return await get(buildQuery('/domains/ldap/check', { organization: 0, ...params }));
  };
}

export async function deleteOrphans(params: DeleteOrphanedUsersParams) {
  return await yeet(buildQuery('/domains/ldap/check', { organization: 0, ...params }));
}

export function ldapConfig() {
  return async () => {
    return await get('/system/mconf/ldap');
  };
}

export async function updateLdap(config: LdapConfigData, params: { force?: boolean & URLParams }) {
  return await put(buildQuery('/system/mconf/ldap', params), config);
}

export async function deleteLdap() {
  return await yeet('/system/mconf/ldap');
}

export function authmgr() {
  return async () => {
    return await get('/system/mconf/authmgr');
  };
}

export async function setAuthmgr(config: { authBackendSelection: string }) {
  return await put('/system/mconf/authmgr', config);
}

/* ORG LDAP */

export function orgLdapConfig(orgID: number) {
  return async () => await get(`/system/orgs/${orgID}/ldap`);
}

export async function updateOrgLdap(orgID: number, config: LdapConfigData, params={}) {
  return await put(buildQuery(`/system/orgs/${orgID}/ldap`, params), config);
}

export async function orgSyncAll(orgID: number, params: SyncLdapParams) {
  return await post(buildQuery('/system/orgs/' + orgID + '/ldap/downsync', params));
}

export async function deleteOrgLdap(orgID: number) {
  return await yeet(`/system/orgs/${orgID}/ldap`);
}

/*
  ROLES
*/

export async function roles(params: URLParams={}) {
  return await get(buildQuery('/system/roles', { level: 2 , ...params}));
}

export function role(id: number) {
  return async () => {
    return await get('/system/roles/' + id);
  };
}

export function addRole(role: NewRole) {
  return async () => {
    return await post('/system/roles', role);
  };
}

export function editRole(role: UpdateRole) {
  return async () => {
    return await patch('/system/roles/' + role.ID, { ...role, ID: undefined });
  };
}

export function deleteRole(id: number) {
  return async () => {
    return await yeet('/system/roles/' + id);
  };
}

/*
  PERMISSIONS
*/

export function permissions() {
  return async () => {
    return await get('/system/roles/permissions');
  };
}

/*
  License
*/

export function license() {
  return async () => {
    return await get('/system/license');
  };
}

export function uploadLicense(license: File) {
  return async () => {
    return await uploadPut('/system/license', license);
  };
}

export function licenseCreds() {
  return async () => {
    return await get('/system/license/creds');
  };
}

export function putLicenseCreds(creds: { username: string, password: string }) {
  return async () => {
    return await put('/system/license/creds', creds);
  };
}

/*
  FOLDERS
*/

export function folderTree(domainID: number, params: URLParams={}) {
  return async () => {
    return await get(buildQuery('/domains/' + domainID + '/folders/tree', params));
  };
}

export function folderDetails(domainID: number, folderID: string) {
  return async () => {
    return await get('/domains/' + domainID + '/folders/' + folderID);
  };
}

export async function addFolder(domainID: number, folder: Omit<NewFolder, 'owners'>) {
  return await post('/domains/' + domainID + '/folders', folder);
}

export function editFolder(domainID: number, folder: UpdateFolder) {
  return async () => {
    return await patch('/domains/' + domainID + '/folders/' + folder.folderid, { ...folder, folderid: undefined });
  };
}

export async function deleteFolder(domainID: number, id: string, params: { clear: boolean }) {
  return await yeet(buildQuery('/domains/' + domainID + '/folders/' + id, params));
}

/*
  OWNERS
*/

export async function owners(domainID: number, folderID: string, params: URLParams={}) {
  return await get(buildQuery('/domains/' + domainID + '/folders/' + folderID + '/owners', params));
}

export async function addOwner(domainID: number, folderID: string, username: { username: string }) {
  return await post('/domains/' + domainID + '/folders/' + folderID + '/owners', username);
}

export async function deleteOwner(domainID: number, folderID: string, memberID: number) {
  return await yeet('/domains/' + domainID + '/folders/' + folderID + '/owners/' + memberID);
}

export async function putFolderPermissions(domainID: number, folderID: string, memberID: number, permissions: any) {
  return await put('/domains/' + domainID + '/folders/' + folderID + '/owners/' + memberID, permissions);
}

/*
  ORGS
*/

export async function orgs(params: URLParams={}) {
  return await get(buildQuery('/system/orgs', params));
}

export function orgDetails(id: number) {
  return async () => {
    return await get('/system/orgs/' + id);
  };
}

export function addOrg(org: NewOrg) {
  return async () => {
    return await post('/system/orgs', org);
  };
}

export function editOrg(org: UpdateOrg) {
  return async () => {
    return await patch('/system/orgs/' + org.ID, { ...org, ID: undefined });
  };
}

export function deleteOrg(id: number) {
  return async () => {
    return await yeet('/system/orgs/' + id);
  };
}

/*
  SERVERS
*/

export async function servers(params: URLParams={}) {
  return await get(buildQuery('/system/servers', params));
}

export function serverDetails(id: number) {
  return async () => {
    return await get('/system/servers/' + id);
  };
}

export function addServer(server: NewServer) {
  return async () => {
    return await post('/system/servers', server);
  };
}

export function editServer(server: UpdateServer) {
  return async () => {
    return await patch('/system/servers/' + server.ID, { ...server, ID: undefined });
  };
}

export function deleteServer(id: number) {
  return async () => {
    return await yeet('/system/servers/' + id);
  };
}

export function serversPolicy() {
  return async () => {
    return await get('/system/dbconf/grommunio-admin/multi-server/');
  };
}

export async function editServerPolicy(data: { data: { policy: ServerPolicy } }) {
  return await patch('/system/dbconf/grommunio-admin/multi-server/', data);
}

export function serverDnsCheck() {
  return async () => {
    return await get('/system/servers/dnsCheck');
  };
}

/*
  LOGS
*/

export function logs(params: URLParams={}) {
  return async () => {
    return await get(buildQuery('/system/logs', params));
  };
}

export function log(filename: string, params: LogURLParams) {
  return async () => {
    return await get(buildQuery('/system/logs/' + filename, params));
  };
}

export function updateLog(pid: string) {
  return async () => {
    return await get('/system/updateLog/' + pid);
  };
}

/*
  SYNC
*/

export async function grommunioSync(params: FetchSyncParams) {
  return await get(buildQuery('/system/sync/top', params));
}

/*
  GROUPS
*/

export async function groups(domainID: number, params: URLParams={}) {
  return await get(buildQuery('/domains/' + domainID + '/mlists', params));
}

export function addGroup(domainID: number, group: NewGroup) {
  return async () => {
    return await post('/domains/' + domainID + '/mlists', group);
  };
}

export function editGroup(domainID: number, group: UpdateGroup) {
  return async () => {
    return await patch('/domains/' + domainID + '/mlists/' + group.ID, { ...group, ID: undefined });
  };
}

export function deleteGroup(domainID: number, id: number) {
  return async () => {
    return await yeet('/domains/' + domainID + '/mlists/' + id);
  };
}

export async function groupDetails(domainID: number, id: number) {
  return await get('/domains/' + domainID + '/mlists/' + id);
}

/*
  DBCONF
*/

export async function dbconf(params: URLParams={}) {
  return await get(buildQuery('/system/dbconf/', params));
}

export async function commands(params: URLParams={}) {
  return await get(buildQuery('/system/dbconf/commands', params));
}

export async function uploadFile(service: string, filename: string, file: Record<string, any>) {
  return await put('/system/dbconf/' + service + '/' + filename + '/',  { data: file });
}

export function renameService(oldName: string, name: string) {
  return async () => {
    return await patch('/system/dbconf/' + oldName + '/', { name });
  };
}

export function serviceFiles(service: string) {
  return async () => {
    return await get('/system/dbconf/' + service + '/');
  };
}

export function serviceFile(service: string, filename: string) {
  return async () => {
    return await get('/system/dbconf/' + service + '/' + filename + '/');
  };
}

export function editFile(service: string, filename: string, file: { data: Record<string, string> }) {
  return async () => {
    return await put('/system/dbconf/' + service + '/' + filename + '/', file);
  };
}

export async function deleteService(service: string) {
  return await yeet('/system/dbconf/' + service + '/');
}

export async function deleteFile(service: string, file: string) {
  return await yeet('/system/dbconf/' + service + '/' + file + '/');
}

/*
  VHOSTS
*/

export function vhosts() {
  return async () => {
    return await get('/system/vhostStatus');
  };
}

export function vhostStatus(name: string) {
  return async () => {
    return await get('/system/vhostStatus/' + name);
  };
}

/*
  MAIL-QUEUE
*/

export function mailq() {
  return async () => {
    return await get('/system/mailq');
  };
}

export async function flush(params: { queue: string }) {
  return await post(buildQuery('/system/mailq/flush', params));
}

export function deleteMailq(queue: string) {
  return async () => {
    return await post(buildQuery('/system/mailq/delete', { queue }));
  };
}

export function requeueMailq(queue: number) {
  return async () => {
    return await post(buildQuery('/system/mailq/requeue', { queue }));
  };
}

/*
  TASK-QUEUE
*/

export function taskq(params: URLParams={}) {
  return async () => {
    return await get(buildQuery('/tasq/tasks', params));
  };
}

export function startTaskq() {
  return async () => {
    return await post('/tasq/start');
  };
}

export function stopTaskq() {
  return async () => {
    return await post('/tasq/stop');
  };
}

export function taskqStatus() {
  return async () => {
    return await get('/tasq/status');
  };
}

export function taskDetails(id: number) {
  return async () => {
    return await get('/tasq/tasks/' + id);
  };
}

export function taskDelete(id: number) {
  return async () => {
    return await yeet('/tasq/tasks/' + id);
  };
}

export function taskCancel(id: number) {
  return async () => {
    return await post('/tasq/tasks/' + id + '/cancel');
  };
}

// I must have been drunk when implementing this callstack. TODO: Reimplement.
export function createParams(domainID: number, params: any) {
  const path = '/defaults/createParams' + (domainID ? '/' + domainID : '');
  return async () => {
    return await get(buildQuery(path, params));
  };
}

// I must have been drunk when implementing this callstack. TODO: Reimplement.
export function editCreateParams(data: any, domainID: number | null, params: URLParams) {
  const path = '/defaults/createParams' + (domainID ? '/' + domainID : '');
  return async () => {
    return await put(buildQuery(path, params), data);
  };
}

/*
  ABOUT
*/

export function about() {
  return async () => {
    return await get('/about');
  };
}

/*
  CHANGE PW
*/

export async function changePw(oldPw: string, newPw: string) {
  try {
    return await put('/passwd', { old: oldPw, new: newPw });
  } catch(err) { return Promise.reject(err); }
}

export async function resetPw(username: string, newpassword: string) {
  try {
    return await put('/passwd/' + username, { new: newpassword });
  } catch(err) { return Promise.reject(err); }
}

/*
  CHECK DOMAIN FORMAT
*/

export async function checkFormat(params: { email?: string, domain?: string }) {
  try {
    return await get(buildQuery('/chkFormat', params));
  } catch(err) { return Promise.reject(err); }
}

export async function defaultSyncPolicy() {
  return await get('/service/syncPolicy/default');
}

export async function defaultDomainSyncPolicy(domainID: number) {
  return await get(`/domains/${domainID}/syncPolicy`);
}

export async function storeLangs() {
  return await get('/defaults/storeLangs');
}


/*
 * SPAM
*/

export function spam() {
  return async () => await get("/system/antispam/stat");
}

export function spamThroughput() {
  return async () => await get("/system/antispam/graph?type=week"); // TODO: Change to day
}

export function spamHistory() {
  return async () => await get("/system/antispam/history");
}
