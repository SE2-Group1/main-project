const baseUrl = 'http://localhost:3000/kiruna/api';

function handleInvalidResponse(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  let type = response.headers.get('Content-Type');
  if (type !== null && type.indexOf('application/json') === -1) {
    throw new TypeError(`Expected JSON, got ${type}`);
  }
  return response;
}

const uploadDocument = async document => {
  return await fetch(`${baseUrl}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(document),
  })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const login = async credentials => {
  return await fetch(`${baseUrl}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const logout = async () => {
  return await fetch(`${baseUrl}/sessions/current`, {
    method: 'DELETE',
    credentials: 'include',
  }).then(handleInvalidResponse);
};

const getStakeholders = async () => {
  //TODO modify the url if needed
  return await fetch(`${baseUrl}/stakeholders`)
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getScales = async () => {
  return await fetch(`${baseUrl}/scales`)
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getTypes = async () => {
  return await fetch(`${baseUrl}/types`)
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const API = {
  login,
  logout,
  uploadDocument,
  getStakeholders,
  getScales,
  getTypes,
};
export default API;
