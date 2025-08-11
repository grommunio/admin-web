// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH
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

export function login(user, pass) {
  return async () => {
    return await loginPost('/login', `user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
  };
}

export function renewToken() {
  return async () => {
    return await renew();
  };
}

export function profile() {
  return async () => {
    return await get('/profile');
  };
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

export function drawerDomains() {
  return async () => {
    return await get(buildQuery('/domains', { domainType: 0, sort: 'domainname,asc' }));
  };
}

export function domains(params) {
  return async () => {
    return await get(buildQuery('/system/domains', { ...params, domainType: 0 }));
  };
}

export function domain(id) {
  return async () => {
    return await get('/system/domains/' + id);
  };
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

export function dns(domainId) {
  return async () => {
    return await get('/domains/' + domainId + '/dnsCheck');
  };
}

/*
  USERS
*/

export function allUsers(params) {
  return async () => {
    return await get(buildQuery('/system/users', {
      ...params,
      addressType: 0,
      matchProps: 'displayname',
      properties: 'displayname,displaytypeex',
    }));
  };
}

export function allContacts(params) {
  return async () => {
    return await get(buildQuery('/system/users', {
      ...params,
      status: USER_STATUS.CONTACT,
      matchProps: 'displayname,smtpaddress',
      properties: 'displayname,smtpaddress',
    }));
  };
}

export function users(domainID, params) {
  return async () => {
    return await get(buildQuery(
      '/domains/' + domainID + '/users', {
        ...params,
        matchProps: 'displayname',
        properties: 'displayname,storagequotalimit,receivequotalimit,messagesizeextended,displaytypeex',
        addressType: 0,
      }));
  };
}

export function usersPlain(domainID, params={}) {
  return async () => {
    return await get(buildQuery(
      '/domains/' + domainID + '/users', {
        level: 0,
        limit: 1000000,
        sort: 'username,asc',
        ...params,
      }));
  };
}

export function userList() {
  return async () => {
    return await get('/users');
  };
}

export function contacts(domainID, params) {
  return async () => {
    return await get(buildQuery(
      '/domains/' + domainID + '/users', {
        ...params,
        status: USER_STATUS.CONTACT,
        matchProps: 'displayname,smtpaddress',
        properties: 'displayname,smtpaddress',
      }));
  };
}

export function userCount(domainID) {
  return async () => {
    return await get(buildQuery('/domains/' + domainID + '/users', { limit: 0, status: USER_STATUS.NORMAL }));
  };
}

export function user(domainID, userID) {
  return async () => {
    return await get('/domains/' + domainID + '/users/'+ userID);
  };
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

export function editUserSendAs(domainID, userID, delegates) {
  return async () => {
    return await put('/domains/' + domainID + '/users/'+ userID + '/sendas', delegates);
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

export function syncAll(params, domainID) {
  return async () => {
    return await post(buildQuery('/domains/' + (domainID !== undefined ? domainID + '/' : '')
      + 'ldap/downsync', { ...params }));
  };
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

export function deleteOrphans(params) {
  return async () => {
    return await yeet(buildQuery('/domains/ldap/check', { organization: 0, ...params }));
  };
}

export function ldapConfig() {
  return async () => {
    return await get('/system/mconf/ldap');
  };
}

export function updateLdap(config, params) {
  return async () => {
    return await put(buildQuery('/system/mconf/ldap', params), config);
  };
}

export function deleteLdap() {
  return async () => {
    return await yeet('/system/mconf/ldap');
  };
}

export function authmgr() {
  return async () => {
    return await get('/system/mconf/authmgr');
  };
}

export function setAuthmgr(config) {
  return async () => {
    return await put('/system/mconf/authmgr', config);
  };
}

/* ORG LDAP */

export function orgLdapConfig(orgID, params={}) {
  return async () => await get(buildQuery(`/system/orgs/${orgID}/ldap`, params));
}

export function updateOrgLdap(orgID, config, params={}) {
  return async () => await put(buildQuery(`/system/orgs/${orgID}/ldap`, params), config);
}

export function orgSyncAll(orgID, params={}) {
  return async () => {
    return await post(buildQuery('/system/orgs/' + orgID + '/ldap/downsync', params));
  };
}

export function deleteOrgLdap(orgID) {
  return async () => await yeet(`/system/orgs/${orgID}/ldap`);
}

/*
  ROLES
*/

export function roles(params) {
  return async () => {
    return await get(buildQuery('/system/roles', { ...params, level: 2 }));
  };
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

export function permissions(params) {
  return async () => {
    return await get(buildQuery('/system/roles/permissions', params));
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

export function folders(domainID, params) {
  return async () => {
    return await get(buildQuery('/domains/' + domainID + '/folders', params));
  };
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

export function addFolder(domainID, folder) {
  return async () => {
    return await post('/domains/' + domainID + '/folders', folder);
  };
}

export function editFolder(domainID, folder) {
  return async () => {
    return await patch('/domains/' + domainID + '/folders/' + folder.folderid, { ...folder, folderid: undefined });
  };
}

export function deleteFolder(domainID, id, params) {
  return async () => {
    return await yeet(buildQuery('/domains/' + domainID + '/folders/' + id, params));
  };
}

/*
  OWNERS
*/

export function owners(domainID, folderID, params) {
  return async () => {
    return await get(buildQuery('/domains/' + domainID + '/folders/' + folderID + '/owners', params));
  };
}

export function addOwner(domainID, folderID, username) {
  return async () => {
    return await post('/domains/' + domainID + '/folders/' + folderID + '/owners', username);
  };
}

export function deleteOwner(domainID, folderID, memberID) {
  return async () => {
    return await yeet('/domains/' + domainID + '/folders/' + folderID + '/owners/' + memberID);
  };
}

export function putFolderPermissions(domainID, folderID, memberID, permissions) {
  return async () => {
    return await put('/domains/' + domainID + '/folders/' + folderID + '/owners/' + memberID, permissions);
  };
}

/*
  ORGS
*/

export function orgs(params) {
  return async () => {
    return await get(buildQuery('/system/orgs', params));
  };
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

export function servers(params) {
  return async () => {
    return await get(buildQuery('/system/servers', params));
  };
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

export function editServerPolicy(data) {
  return async () => {
    return await patch('/system/dbconf/grommunio-admin/multi-server/', data);
  };
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

export function grommunioSync(params) {
  return async () => {
    return await get(buildQuery('/system/sync/top', params));
  };
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

export function groups(domainID, params) {
  return async () => {
    return await get(buildQuery('/domains/' + domainID + '/mlists', params));
  };
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

export function groupDetails(domainID, id) {
  return async () => {
    return await get('/domains/' + domainID + '/mlists/' + id);
  };
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

export function dbconf(params) {
  return async () => {
    return await get(buildQuery('/system/dbconf/', params));
  };
}

export function commands(params) {
  return async () => {
    return await get(buildQuery('/system/dbconf/commands', params));
  };
}

export function uploadFile(service, filename, file) {
  return async () => {
    return await put('/system/dbconf/' + service + '/' + filename + '/',  { data: file });
  };
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

export function deleteService(service) {
  return async () => {
    return await yeet('/system/dbconf/' + service + '/');
  };
}

export function deleteFile(service, file) {
  return async () => {
    return await yeet('/system/dbconf/' + service + '/' + file + '/');
  };
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

export function flush(params) {
  return async () => {
    return await post(buildQuery('/system/mailq/flush', params));
  };
}

export function deleteMailq(params) {
  return async () => {
    return await post(buildQuery('/system/mailq/delete', params));
  };
}

export function requeueMailq(params) {
  return async () => {
    return await post(buildQuery('/system/mailq/requeue', params));
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

export function startTaskq(params) {
  return async () => {
    return await post(buildQuery('/tasq/start', params));
  };
}

export function stopTaskq(params) {
  return async () => {
    return await post(buildQuery('/tasq/stop', params));
  };
}

export function taskqStatus(params) {
  return async () => {
    return await get(buildQuery('/tasq/status', params));
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

export function defaultSyncPolicy() {
  return async () => {
    return await get('/service/syncPolicy/default');
  };
}

export function defaultDomainSyncPolicy(domainID) {
  return async () => {
    return await get(`/domains/${domainID}/syncPolicy`);
  };
}

export function storeLangs() {
  return async () => {
    return await get('/defaults/storeLangs');
  };
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
