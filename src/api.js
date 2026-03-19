// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH
import { USER_STATUS } from './constants';
import store from './store';

const baseUrl = '//' + window.location.host + '/api/v1';

/**
 * Handles fetch api errors
 * 
 * @param {Response} response response from fetch api
 * @returns {Object} response json body
 * @throws {Error} response error message
 */
async function handleErrors(response) {
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
 * 
 * @param {Response} response response from fetch api
 * @returns {Object} response json body
 * @throws {Error} response error message
 */
async function handleLoginErrors(response) {
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
 * 
 * @param {String} path path to call
 * @returns {Promise}
 */
async function get(path) {
  return await fetch(baseUrl + path)
    .then(handleErrors);
}

/**
 * Sends PATCH request to rest api
 * 
 * @param {String} path path to call
 * @param {Object} data data to send in request body
 * @returns {Promise}
 */
async function patch(path, data) {
  const csrf = store.getState().auth.csrf;
  return fetch((baseUrl + path), {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrf,
    },
  }).then(handleErrors);
}

/**
 * Sends POST request to rest api
 * 
 * @param {String} path path to call
 * @param {Object} data data to send in request body
 * @returns {Promise}
 */
async function post(path, data) {
  const csrf = store.getState().auth.csrf;
  return await fetch((baseUrl + path), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrf,
    },
  }).then(handleErrors);
}

/**
 * Sends PUT request to rest api
 * 
 * @param {String} path path to call
 * @param {Object} data data to send in request body
 * @returns {Promise}
 */
async function put(path, data) {
  const csrf = store.getState().auth.csrf;
  return await fetch((baseUrl + path), {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrf,
    },
  }).then(handleErrors);
}

/**
 * Sends DELETE request to rest api
 * 
 * @param {String} path path to call
 * @returns {Promise}
 */
async function yeet(path) {
  const csrf = store.getState().auth.csrf;
  return await fetch((baseUrl + path), {
    method: 'DELETE',
    headers: {
      'X-CSRF-TOKEN': csrf,
    },
  }).then(handleErrors);
}

/**
 * Sends PUT request to rest api (for fileuploads only)
 * 
 * @param {String} path path to call
 * @param {Object} data data to send in request body
 * @returns {Promise}
 */
async function uploadPut(path, data) {
  const csrf = store.getState().auth.csrf;
  return fetch((baseUrl + path), {
    method: 'PUT',
    body: data,
    headers: {
      'X-CSRF-TOKEN': csrf,
    },
  }).then(handleErrors);
}

/**
 * Sends POST request to rest api (for authentication only)
 * 
 * @param {String} path path to call
 * @param {Object} data data to send in request body
 * @returns {Promise}
 */
async function loginPost(path, data) {
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
 * 
 * @param {String} path path to call
 * @param {Object} data data to send in request body
 * @returns {Promise}
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
 * 
 * @param {String} endpoint endpoint path/url
 * @param {Object} params parameters to convert to `key=value,` strings
 * @returns {String} created query string
 */
function buildQuery(endpoint, params={}) {
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

export async function login(user, pass) {
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

export function postServices(service, action) {
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

export function update(action, repo="supported") {
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

export async function domains(params) {
  return await get(buildQuery('/system/domains', { ...params, domainType: 0 }));
}

export async function domain(id) {
  return await get('/system/domains/' + id);
}

export function addDomain(domain, params) {
  return async () => {
    return await post(buildQuery('/system/domains', params), domain);
  };
}

export function editDomain(domain) {
  return async () => {
    return await patch('/system/domains/' + domain.ID, { ...domain, ID: undefined });
  };
}

export function deleteDomain(id, params) {
  return async () => {
    return await yeet(buildQuery('/system/domains/' + id, params));
  };
}

export async function changeDomainPassword(id, newPw) {
  try {
    return await put('/system/domains/' + id + '/password', { new: newPw });
  } catch(err) { console.error(err); }
}

export async function dns(domainId) {
  return await get('/domains/' + domainId + '/dnsCheck');
}

/*
  USERS
*/

export async function allUsers(params) {
  return await get(buildQuery('/system/users', {
    ...params,
    addressType: 0,
    matchProps: 'displayname',
    properties: 'displayname,displaytypeex',
  }));
}

export async function allContacts(params) {
  return await get(buildQuery('/system/users', {
    ...params,
    status: USER_STATUS.CONTACT,
    matchProps: 'displayname,smtpaddress',
    properties: 'displayname,smtpaddress',
  }));
}

export async function users(domainID, params) {
  return await get(buildQuery(
    '/domains/' + domainID + '/users', {
      ...params,
      matchProps: 'displayname',
      properties: 'displayname,storagequotalimit,receivequotalimit,messagesizeextended,displaytypeex',
      addressType: 0,
    }));
}

export async function usersPlain(domainID, params={}) {
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

export async function contacts(domainID, params) {
  return await get(buildQuery(
    '/domains/' + domainID + '/users', {
      ...params,
      status: USER_STATUS.CONTACT,
      matchProps: 'displayname,smtpaddress',
      properties: 'displayname,smtpaddress',
    }));
}

export async function userCount(domainID) {
  return await get(buildQuery('/domains/' + domainID + '/users', { limit: 0, status: USER_STATUS.NORMAL }));
}

export async function user(domainID, userID) {
  return await get('/domains/' + domainID + '/users/'+ userID);
}

export function addUser(domainID, user) {
  return async () => {
    return await post('/domains/' + domainID + '/users', user);
  };
}

export function editUser(domainID, user) {
  return async () => {
    return await patch('/domains/' + domainID + '/users/' + user.ID, { ...user, ID: undefined });
  };
}

export function deleteUser(domainID, id, params) {
  return async () => {
    return await yeet(buildQuery('/domains/' + domainID + '/users/' + id, params));
  };
}

export async function changeUserPassword(domainID, id, newPw) {
  try {
    return await put('/domains/' + domainID + '/users/' + id + '/password',
      { new: newPw });
  } catch(err) { return Promise.reject(err); }
}

export function editUserRole(domainID, userID, roles) {
  return async () => {
    return await patch('/domains/' + domainID + '/users/' + userID + '/roles', roles);
  };
}

export function userSync(domainID, userID) {
  return async () => {
    return await get('/domains/' + domainID + '/users/'+ userID + '/sync');
  };
}

export function removeUserSync(domainID, userID) {
  return async () => {
    return await yeet('/domains/' + domainID + '/users/'+ userID + '/sync');
  };
}

export function remoteWipeEngage(domainID, userID, deviceId, request) {
  return async () => {
    return await post('/domains/' + domainID + '/users/'+ userID + '/sync/' + deviceId + '/wipe', request);
  };
}

export function remoteWipeCancel(domainID, userID, deviceId) {
  return async () => {
    return await yeet('/domains/' + domainID + '/users/'+ userID + '/sync/' + deviceId + '/wipe');
  };
}

export function remoteResyncEngage(domainID, userID, deviceId) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/sync/' + deviceId + '/resync');
  };
}

export function remoteDeleteEngage(domainID, userID, deviceId) {
  return async () => {
    return await yeet('/domains/' + domainID + '/users/'+ userID + '/sync/' + deviceId);
  };
}

export function userDelegates(domainID, userID) {
  return async () => {
    return await get('/domains/' + domainID + '/users/'+ userID + '/delegates');
  };
}

export function editUserDelegates(domainID, userID, delegates) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/delegates', delegates);
  };
}

export function userSendAs(domainID, userID) {
  return async () => {
    return await get('/domains/' + domainID + '/users/'+ userID + '/sendas');
  };
}

export function editUserSendAs(domainID, userID, sendAs) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/sendas', sendAs);
  };
}

export function permittedUsers(domainID, userID, params) {
  return async () => {
    return await get(buildQuery('/domains/' + domainID + '/users/'+ userID + '/storeAccess', params));
  };
}

export function setPermittedUser(domainID, userID, permittedUsers) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/storeAccess', permittedUsers);
  };
}

export function deletePermittedUser(domainID, userID, id) {
  return async () => {
    return await yeet('/domains/' + domainID + '/users/'+ userID + '/storeAccess/' + id);
  };
}

export function userOof(domainID, userID) {
  return async () => {
    return await get('/domains/' + domainID + '/users/'+ userID + '/oof');
  };
}

export function putUserOof(domainID, userID, oofSettings) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/oof', oofSettings);
  };
}

/* LDAP */

export function searchLdap(params) {
  return async () => {
    return await get(buildQuery('/domains/ldap/search', { organization: 0, ...params }));
  };
}

export function importUser(params) {
  return async () => {
    return await post(buildQuery('/domains/ldap/importUser', { organization: 0, ...params }));
  };
}

export function sync(domainID, userID) {
  return async () => {
    return await put('/domains/' + domainID + '/users/' + userID + '/downsync');
  };
}

export async function syncAll(params, domainID) {
  return await post(buildQuery('/domains/' + (domainID !== undefined ? domainID + '/' : '')
    + 'ldap/downsync', { ...params }));
}

export function ldapDump(params) {
  return async () => {
    return await get(buildQuery('/domains/ldap/dump', { ...params }));
  };
}

export function checkLdap(params) {
  return async () => {
    return await get(buildQuery('/domains/ldap/check', { organization: 0, ...params }));
  };
}

export async function deleteOrphans(params) {
  return await yeet(buildQuery('/domains/ldap/check', { organization: 0, ...params }));
}

export function ldapConfig() {
  return async () => {
    return await get('/system/mconf/ldap');
  };
}

export async function updateLdap(config, params) {
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

export async function setAuthmgr(config) {
  return await put('/system/mconf/authmgr', config);
}

/* ORG LDAP */

export function orgLdapConfig(orgID) {
  return async () => await get(`/system/orgs/${orgID}/ldap`);
}

export async function updateOrgLdap(orgID, config, params={}) {
  return await put(buildQuery(`/system/orgs/${orgID}/ldap`, params), config);
}

export async function orgSyncAll(orgID, params={}) {
  return await post(buildQuery('/system/orgs/' + orgID + '/ldap/downsync', params));
}

export async function deleteOrgLdap(orgID) {
  return await yeet(`/system/orgs/${orgID}/ldap`);
}

/*
  ROLES
*/

export async function roles(params) {
  return await get(buildQuery('/system/roles', { level: 2 , ...params}));
}

export function role(id) {
  return async () => {
    return await get('/system/roles/' + id);
  };
}

export function addRole(role) {
  return async () => {
    return await post('/system/roles', role);
  };
}

export function editRole(role) {
  return async () => {
    return await patch('/system/roles/' + role.ID, { ...role, ID: undefined });
  };
}

export function deleteRole(id) {
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

export function uploadLicense(license) {
  return async () => {
    return await uploadPut('/system/license', license);
  };
}

export function licenseCreds() {
  return async () => {
    return await get('/system/license/creds');
  };
}

export function putLicenseCreds(creds) {
  return async () => {
    return await put('/system/license/creds', creds);
  };
}

/*
  FOLDERS
*/

export async function folders(domainID, params) {
  return await get(buildQuery('/domains/' + domainID + '/folders', params));
}

export function folderTree(domainID, params) {
  return async () => {
    return await get(buildQuery('/domains/' + domainID + '/folders/tree', params));
  };
}

export function folderDetails(domainID, folderID) {
  return async () => {
    return await get('/domains/' + domainID + '/folders/' + folderID);
  };
}

export async function addFolder(domainID, folder) {
  return await post('/domains/' + domainID + '/folders', folder);
}

export function editFolder(domainID, folder) {
  return async () => {
    return await patch('/domains/' + domainID + '/folders/' + folder.folderid, { ...folder, folderid: undefined });
  };
}

export async function deleteFolder(domainID, id, params) {
  return await yeet(buildQuery('/domains/' + domainID + '/folders/' + id, params));
}

/*
  OWNERS
*/

export async function owners(domainID, folderID, params) {
  return await get(buildQuery('/domains/' + domainID + '/folders/' + folderID + '/owners', params));
}

export async function addOwner(domainID, folderID, username) {
  return await post('/domains/' + domainID + '/folders/' + folderID + '/owners', username);
}

export async function deleteOwner(domainID, folderID, memberID) {
  return await yeet('/domains/' + domainID + '/folders/' + folderID + '/owners/' + memberID);
}

export async function putFolderPermissions(domainID, folderID, memberID, permissions) {
  return await put('/domains/' + domainID + '/folders/' + folderID + '/owners/' + memberID, permissions);
}

/*
  ORGS
*/

export async function orgs(params) {
  return await get(buildQuery('/system/orgs', params));
}

export function orgDetails(id) {
  return async () => {
    return await get('/system/orgs/' + id);
  };
}

export function addOrg(org) {
  return async () => {
    return await post('/system/orgs', org);
  };
}

export function editOrg(org) {
  return async () => {
    return await patch('/system/orgs/' + org.ID, { ...org, ID: undefined });
  };
}

export function deleteOrg(id) {
  return async () => {
    return await yeet('/system/orgs/' + id);
  };
}

/*
  SERVERS
*/

export async function servers(params) {
  return await get(buildQuery('/system/servers', params));
}

export function serverDetails(id) {
  return async () => {
    return await get('/system/servers/' + id);
  };
}

export function addServer(server) {
  return async () => {
    return await post('/system/servers', server);
  };
}

export function editServer(server) {
  return async () => {
    return await patch('/system/servers/' + server.ID, { ...server, ID: undefined });
  };
}

export function deleteServer(id) {
  return async () => {
    return await yeet('/system/servers/' + id);
  };
}

export function serversPolicy() {
  return async () => {
    return await get('/system/dbconf/grommunio-admin/multi-server/');
  };
}

export async function editServerPolicy(data) {
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

export function logs(params) {
  return async () => {
    return await get(buildQuery('/system/logs', params));
  };
}

export function log(filename, params) {
  return async () => {
    return await get(buildQuery('/system/logs/' + filename, params));
  };
}

export function updateLog(pid) {
  return async () => {
    return await get('/system/updateLog/' + pid);
  };
}

/*
  SYNC
*/

export async function grommunioSync(params) {
  return await get(buildQuery('/system/sync/top', params));
}

/*
  FORWARDS
*/

export function forwards() {
  return async () => {
    return await get('/forwards');
  };
}

export function addForward(forward) {
  return async () => {
    return await post('/forwards', forward);
  };
}

export function editForward(forward) {
  return async () => {
    return await patch('/forwards/' + forward.ID, forward);
  };
}

export function deleteForward(id) {
  return async () => {
    return await yeet('/forwards/' + id);
  };
}

/*
  GROUPS
*/

export async function groups(domainID, params) {
  return await get(buildQuery('/domains/' + domainID + '/mlists', params));
}

export function addGroup(domainID, mlist) {
  return async () => {
    return await post('/domains/' + domainID + '/mlists', mlist);
  };
}

export function editGroup(domainID, mlist) {
  return async () => {
    return await patch('/domains/' + domainID + '/mlists/' + mlist.ID, { ...mlist, ID: undefined });
  };
}

export function deleteGroup(domainID, id) {
  return async () => {
    return await yeet('/domains/' + domainID + '/mlists/' + id);
  };
}

export async function groupDetails(domainID, id) {
  return await get('/domains/' + domainID + '/mlists/' + id);
}

/*
  CLASSES
*/

export function classes(domainID, params) {
  return async () => {
    return await get(buildQuery('/domains/' + domainID + '/classes', params));
  };
}

export function classesTree(domainID, params) {
  return async () => {
    return await get(buildQuery('/domains/' + domainID + '/classes/tree', params));
  };
}

export function addClass(domainID, _class) {
  return async () => {
    return await post('/domains/' + domainID + '/classes', _class);
  };
}

export function editClass(domainID, _class) {
  return async () => {
    return await patch('/domains/' + domainID + '/classes/' + _class.ID, { ..._class, ID: undefined });
  };
}

export function deleteClass(domainID, id) {
  return async () => {
    return await yeet('/domains/' + domainID + '/classes/' + id);
  };
}

export function classDetails(domainID, id) {
  return async () => {
    return await get('/domains/' + domainID + '/classes/' + id);
  };
}

/*
  DBCONF
*/

export async function dbconf(params) {
  return await get(buildQuery('/system/dbconf/', params));
}

export async function commands(params) {
  return await get(buildQuery('/system/dbconf/commands', params));
}

export async function uploadFile(service, filename, file) {
  return await put('/system/dbconf/' + service + '/' + filename + '/',  { data: file });
}

export function renameService(oldName, name) {
  return async () => {
    return await patch('/system/dbconf/' + oldName + '/', { name });
  };
}

export function serviceFiles(service) {
  return async () => {
    return await get('/system/dbconf/' + service + '/');
  };
}

export function serviceFile(service, filename) {
  return async () => {
    return await get('/system/dbconf/' + service + '/' + filename + '/');
  };
}

export function editFile(service, filename, file) {
  return async () => {
    return await put('/system/dbconf/' + service + '/' + filename + '/', file);
  };
}

export async function deleteService(service) {
  return await yeet('/system/dbconf/' + service + '/');
}

export async function deleteFile(service, file) {
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

export function vhostStatus(name) {
  return async () => {
    return await get('/system/vhostStatus/' + name);
  };
}

/*
  MEMBERS
*/

export function members() {
  return async () => {
    return await get('/members');
  };
}

export function addMember(member) {
  return async () => {
    return await post('/members', member);
  };
}

export function editMember(member) {
  return async () => {
    return await patch('/members/' + member.ID, member);
  };
}

export function deleteMember(id) {
  return async () => {
    return await yeet('/members/' + id);
  };
}

/*
  MAIL ADDRESSES
*/

export async function mailAddresses(domain) {
  try {
    return await get('/system/' + domain + '/mailAddresses');
  } catch(err) { console.error(err); }
}

export async function addMailAddress(domain, mail) {
  try {
    return await post('/system/' + domain + '/mailAddresses', mail);
  } catch(err) { console.error(err); }
}

export async function editMailAddress(domain, mail) {
  try {
    return await patch('/system/' + domain + '/mailAddresses', mail);
  } catch(err) { console.error(err); }
}

export async function deleteMailAddress(domain, id) {
  try {
    return await yeet('/system/' + domain + '/mailAddresses/' + id);
  } catch(err) { console.error(err); }
}

/*
  MAIL-QUEUE
*/

export function mailq() {
  return async () => {
    return await get('/system/mailq');
  };
}

export async function flush(params) {
  return await post(buildQuery('/system/mailq/flush', params));
}

export function deleteMailq(queue) {
  return async () => {
    return await post(buildQuery('/system/mailq/delete', { queue }));
  };
}

export function requeueMailq(queue) {
  return async () => {
    return await post(buildQuery('/system/mailq/requeue', { queue }));
  };
}

/*
  TASK-QUEUE
*/

export function taskq(params) {
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

export function taskDetails(id) {
  return async () => {
    return await get('/tasq/tasks/' + id);
  };
}

export function taskDelete(id) {
  return async () => {
    return await yeet('/tasq/tasks/' + id);
  };
}

export function taskCancel(id) {
  return async () => {
    return await post('/tasq/tasks/' + id + '/cancel');
  };
}

export function createParams(domainID, params) {
  const path = '/defaults/createParams' + (domainID ? '/' + domainID : '');
  return async () => {
    return await get(buildQuery(path, params));
  };
}

export function editCreateParams(data, domainID, params) {
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

export async function changePw(oldPw, newPw) {
  try {
    return await put('/passwd', { old: oldPw, new: newPw });
  } catch(err) { return Promise.reject(err); }
}

export async function resetPw(username, newpassword) {
  try {
    return await put('/passwd/' + username, { new: newpassword });
  } catch(err) { return Promise.reject(err); }
}

/*
  CHECK DOMAIN FORMAT
*/

export async function checkFormat(params) {
  try {
    return await get(buildQuery('/chkFormat', params));
  } catch(err) { return Promise.reject(err); }
}

export async function defaultSyncPolicy() {
  return await get('/service/syncPolicy/default');
}

export async function defaultDomainSyncPolicy(domainID) {
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
