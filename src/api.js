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