const baseUrl = '//' + window.location.host + '/api/v1';

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

async function get(path) {
  return await fetch(baseUrl + path)
    .then(handleErrors)
    .then(response => {
      return response.json();
    });
}

async function patch(path, data) {
  return fetch((baseUrl + path), {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(handleErrors)
    .then(response => response.json());
}

async function post(path, data) {
  return fetch((baseUrl + path), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(handleErrors)
    .then(response => response.json());
}

/*async function put(path, data) {
  return fetch((baseUrl + path), {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(handleErrors)
    .then(response => response.json());
}*/

async function apiDelete(path) {
  return fetch((baseUrl + path), {
    method: 'DELETE',
  }).then(handleErrors)
    .then(response => response.json());
}
/*
async function upload(path, data) {
  return fetch((baseUrl + path), {
    method: 'POST',
    body: data,
  }).then(handleErrors)
    .then(response => response.json());
}

async function uploadPut(path, data) {
  return fetch((baseUrl + path), {
    method: 'PUT',
    body: data,
  }).then(handleErrors)
    .then(response => response.json());
}

async function loginPost(path, data) {
  return await fetch((baseUrl + path), {
    method: 'POST',
    body: data || null,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(handleErrors)
    .then(response => response.json());
}*/

/*
  DOMAINS
*/

export function domains() {
  return async () => {
    return await get('/domains');
  };
}

export function addDomain(domain) {
  return async () => {
    return await post('/domains', domain);
  };
}

export function editDomain(domain) {
  return async () => {
    return await patch('/domains/' + domain.ID, domain);
  };
}

export function deleteDomain(id) {
  return async () => {
    return await apiDelete('/domains/' + id);
  };
}

/*
  USERS
*/

export function users() {
  return async () => {
    return await get('/users');
  };
}

export function addUser(user) {
  return async () => {
    return await post('/users', user);
  };
}

export function editUser(user) {
  return async () => {
    return await patch('/users/' + user.ID, user);
  };
}

export function deleteUser(id) {
  return async () => {
    return await apiDelete('/users/' + id);
  };
}

export async function changeUserPassword(id, oldPw, newPw) {
  try {
    return await post('/users/' + id + '/password', { old: oldPw, new: newPw });
  } catch(err) { console.error(err); }
}

/*
  GROUPS
*/

export function groups() {
  return async () => {
    return await get('/groups');
  };
}

export function addGroup(group) {
  return async () => {
    return await post('/groups', group);
  };
}

export function editGroup(group) {
  return async () => {
    return await patch('/groups/' + group.ID, group);
  };
}

export function deleteGroup(id) {
  return async () => {
    return await apiDelete('/groups/' + id);
  };
}

/*
  FOLDERS
*/

export function folders(domain) {
  return async () => {
    return await get('/' + domain.ID + '/folders');
  };
}

export function addFolder(domain, folder) {
  return async () => {
    return await post('/' + domain.ID + '/folders', folder);
  };
}

export function editFolder(domain, folder) {
  return async () => {
    return await patch('/' + domain.ID + '/folders/' + folder.ID, folder);
  };
}

export function deleteFolder(domain, id) {
  return async () => {
    return await apiDelete('/' + domain.ID + '/folders/' + id);
  };
}

/*
  ORGS
*/

export function orgs() {
  return async () => {
    return await get('/orgs');
  };
}

export function addOrg(org) {
  return async () => {
    return await post('/orgs', org);
  };
}

export function editOrg(org) {
  return async () => {
    return await patch('/orgs/' + org.ID, org);
  };
}

export function deleteOrg(id) {
  return async () => {
    return await apiDelete('/orgs/' + id);
  };
}

/*
  ALIASES
*/

export function aliases() {
  return async () => {
    return await get('/aliases');
  };
}

export function addAlias(alias) {
  return async () => {
    return await post('/aliases', alias);
  };
}

export function editAlias(alias) {
  return async () => {
    return await patch('/aliases/' + alias.ID, alias);
  };
}

export function deleteAlias(id) {
  return async () => {
    return await apiDelete('/aliases/' + id);
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
    return await apiDelete('/forwards/' + id);
  };
}

/*
  MLISTS
*/

export function mlists() {
  return async () => {
    return await get('/mlists');
  };
}

export function addMlist(mlist) {
  return async () => {
    return await post('/mlists', mlist);
  };
}

export function editMlist(mlist) {
  return async () => {
    return await patch('/mlists/' + mlist.ID, mlist);
  };
}

export function deleteMlist(id) {
  return async () => {
    return await apiDelete('/mlists/' + id);
  };
}

/*
  CLASSES
*/

export function classes() {
  return async () => {
    return await get('/classes');
  };
}

export function addClass(Class) {
  return async () => {
    return await post('/classes', Class);
  };
}

export function editClass(Class) {
  return async () => {
    return await patch('/classes/' + Class.ID, Class);
  };
}

export function deleteClass(id) {
  return async () => {
    return await apiDelete('/classes/' + id);
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
    return await apiDelete('/members/' + id);
  };
}

/*
  Sys
*/

export async function dataArea() {
  try {
    return await get('/area_list');
  } catch(err) { console.error(err); }
}

export async function addDataArea(data) {
  try {
    return await post('/area_list', data);
  } catch(err) { console.error(err); }
}

export async function deleteDataArea(id) {
  try {
    return await apiDelete('/area_list/' + id);
  } catch(err) { console.error(err); }
}
/*
  MAIL ADDRESSES
*/

export async function mailAddresses(domain) {
  try {
    return await get('/' + domain + '/mailAddresses');
  } catch(err) { console.error(err); }
}

export async function addMailAddress(domain, mail) {
  try {
    return await post('/' + domain + '/mailAddresses', mail);
  } catch(err) { console.error(err); }
}

export async function editMailAddress(domain, mail) {
  try {
    return await patch('/' + domain + '/mailAddresses', mail);
  } catch(err) { console.error(err); }
}

export async function deleteMailAddress(domain, id) {
  try {
    return await apiDelete('/' + domain + '/mailAddresses/' + id);
  } catch(err) { console.error(err); }
}
