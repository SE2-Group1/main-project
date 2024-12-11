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
  }).then(handleInvalidResponse);
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

const uploadResources = async (docId, resources) => {
  const formData = new FormData();
  formData.append('docId', docId);
  resources.forEach(file => {
    formData.append('resources', file);
  });
  try {
    const response = await fetch(`${baseUrl}/documents/resources/${docId}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to upload resources');
    }

    return response;
  } catch (error) {
    console.error('Error uploading resources:', error);
    throw error;
  }
};

const checkPointInsideArea = async coordinates => {
  return await fetch(`${baseUrl}/areas/checkPointInsideArea`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ coordinates }),
  })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getDocumentResources = async docId => {
  return await fetch(`${baseUrl}/resources/doc/${docId}`, {
    method: 'GET',
  })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const fetchResource = async resourceId => {
  try {
    const response = await fetch(`${baseUrl}/resources/${resourceId}`, {
      method: 'GET',
      credentials: 'include', // include cookies if necessary for authentication
    });

    if (!response.ok) {
      throw new Error('Failed to fetch the resource');
    }

    // Get the content type from the response headers to determine file type
    const contentType = response.headers.get('Content-Type');
    const disposition = response.headers.get('Content-Disposition');

    // Optionally, extract filename from Content-Disposition header if needed
    const filename = disposition
      ? disposition.split('filename=')[1].replace(/"/g, '')
      : 'downloaded_file';

    // Handle the response body as a Blob (file stream)
    const blob = await response.blob();

    // Handle file based on its MIME type
    if (contentType.includes('pdf')) {
      // If PDF, open in a new tab
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
    } else if (
      contentType.includes('image/png') ||
      contentType.includes('image/jpeg') ||
      contentType.includes('image/jpg') ||
      contentType.includes('image/PNG')
    ) {
      // If PNG or JPEG, display the image
      const imgUrl = URL.createObjectURL(blob);
      window.open(imgUrl, '_blank');
    } else if (
      contentType.includes(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', //.docx
        'application/msword', // .doc
      )
    ) {
      // If DOCX, offer for download
      const docUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = docUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(docUrl); // Clean up URL after download
    } else {
      // For unsupported types, offer the file as download
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    }
  } catch (error) {
    console.error('Error fetching resource:', error);
  }
};

const deleteResource = async (docId, resourceid) => {
  return await fetch(`${baseUrl}/resources/${resourceid}/${docId}`, {
    method: 'DELETE',
    credentials: 'include',
  }).then(handleInvalidResponse);
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
  uploadResources,
  checkPointInsideArea,
  getDocumentResources,
  fetchResource,
  deleteResource,
};
export default API;
