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
    credentials: 'include',
    body: JSON.stringify(document),
  })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const updateDocument = async (id, document) => {
  return await fetch(`${baseUrl}/documents/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
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

export const getUserInfo = async () => {
  return await fetch(`${baseUrl}/sessions/current`, {
    credentials: 'include',
  })
    .then(handleInvalidResponse)
    .then(response => response.json());
};

const logout = async () => {
  return await fetch(`${baseUrl}/sessions/current`, {
    method: 'DELETE',
    credentials: 'include',
  }).then(handleInvalidResponse);
};

const getStakeholders = async () => {
  //TODO modify the url if needed
  return await fetch(`${baseUrl}/stakeholders`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getScales = async () => {
  return await fetch(`${baseUrl}/scales`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getLanguages = async () => {
  return await fetch(`${baseUrl}/languages`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getTypes = async () => {
  return await fetch(`${baseUrl}/types`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getAllDocuments = async () => {
  return await fetch(`${baseUrl}/documents`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getDocument = async id => {
  return await fetch(`${baseUrl}/documents/${id}`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const deleteDocument = async id => {
  return await fetch(`${baseUrl}/documents/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  }).then(handleInvalidResponse);
};

const getLinkTypes = async () => {
  return await fetch(`${baseUrl}/linktypes`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const uploadDocumentLinks = async documentLinks => {
  return await fetch(`${baseUrl}/documents/links`, {
    method: 'POST',
    body: JSON.stringify(documentLinks),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
};

const getAllLiksType = async () => {
  return await fetch(`${baseUrl}/links`)
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const uploadDocumentGeoreference = async (docId, coordinates) => {
  return await fetch(`${baseUrl}/documents/georeference`, {
    method: 'POST',
    body: JSON.stringify({ docId, coordinates }),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }).then(handleInvalidResponse);
};

const getGeorefereces = async () => {
  return await fetch(`${baseUrl}/documents/georeference`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getGeorefereceID = async docId => {
  return await fetch(`${baseUrl}/documents/${docId}/georeference`, {
    method: 'GET',
  })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getMunicipalityArea = async () => {
  return await fetch(`${baseUrl}/documents/area/1`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const updateDocumentGeoreference = async (id_file, georeference) => {
  return await fetch(`${baseUrl}/documents/georeference/${id_file}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(georeference),
  }).then(handleInvalidResponse);
};

const getArea = async id => {
  return await fetch(`${baseUrl}/documents/area/${id}`, {
    method: 'GET',
  })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const API = {
  login,
  getUserInfo,
  logout,
  uploadDocument,
  getStakeholders,
  getScales,
  getTypes,
  getAllDocuments,
  getDocument,
  deleteDocument,
  getAllLiksType,
  uploadDocumentLinks,
  getLanguages,
  getLinkTypes,
  uploadDocumentGeoreference,
  getGeorefereces,
  getGeorefereceID,
  getMunicipalityArea,
  updateDocumentGeoreference,
  getArea,
  updateDocument,
};
export default API;
