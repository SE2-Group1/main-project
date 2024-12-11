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

const getYears = async () => {
  return await fetch(`${baseUrl}/documents/years/all`, { method: 'GET' })
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

const getAreasAndPoints = async () => {
  return await fetch(`${baseUrl}/areas/georeference`, {
    method: 'GET',
    credentials: 'include',
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
      credentials: 'include', // Include cookies if necessary for authentication
    });

    if (!response.ok) {
      throw new Error('Failed to fetch the resource');
    }

    // Extract headers for Content-Type and Content-Disposition
    const contentType = response.headers.get('Content-Type');
    const disposition = response.headers.get('content-disposition');

    // Extract filename from Content-Disposition header
    let filename = 'downloaded_file'; // Default filename

    if (disposition) {
      // Find filename using a more robust regex to handle different formats
      const matches =
        disposition.match(/filename="([^"]+)"/) ||
        disposition.match(/filename=([^;]+)/);
      if (matches && matches[1]) {
        filename = decodeURIComponent(matches[1].replace(/"/g, '')); // Decode the filename to handle encoded characters like %20
      }
    }

    // Handle the response body as a Blob (binary data)
    const blob = await response.blob();

    // Helper function to download or open a file
    const handleFileDownload = (blobUrl, filename, openInNewTab = false) => {
      if (openInNewTab) {
        window.open(blobUrl, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(blobUrl); // Clean up the temporary URL
      }
    };

    // Create a blob URL for the file
    const blobUrl = URL.createObjectURL(blob);

    // Handle file based on its MIME type
    if (contentType.includes('pdf')) {
      // Open PDF in a new tab
      handleFileDownload(blobUrl, filename, true);
    } else if (
      contentType.includes('image/png') ||
      contentType.includes('image/jpeg') || // Include jpeg and jpg properly
      contentType.includes('image/jpg') || // Explicit check for jpg
      contentType.includes('image/PNG') || // Include png in any case
      contentType.includes('image/JPEG') // Include JPEG in any case
    ) {
      // Open image in a new tab
      handleFileDownload(blobUrl, filename, true);
    } else if (
      contentType.includes(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      ) ||
      contentType.includes('application/msword') // .doc
    ) {
      // Download Word document
      handleFileDownload(blobUrl, filename);
    } else if (
      contentType.includes(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ) || // .xlsx
      contentType.includes('application/vnd.ms-excel') // .xls
    ) {
      // Download Excel file
      handleFileDownload(blobUrl, filename);
    } else {
      // For unsupported types, download the file by default
      handleFileDownload(blobUrl, filename);
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

const getFilteredDocuments = async (
  searchCriteria,
  searchTerm = '',
  filters = {},
) => {
  const params = new URLSearchParams({
    searchCriteria,
    searchTerm: searchTerm || '',
    filters: JSON.stringify(filters),
  });

  const url = `${baseUrl}/documents/filtered?${params.toString()}`;

  return await fetch(url, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json())
    .catch(error => {
      console.error('Error fetching filtered documents:', error);
      throw error;
    });
};

const getNodesForDiagram = async () => {
  return await fetch(`${baseUrl}/documents/diagram/nodes`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const getEdgesForDiagram = async () => {
  return await fetch(`${baseUrl}/documents/diagram/edges`, { method: 'GET' })
    .then(handleInvalidResponse)
    .then(res => res.json());
};

const updateDiagramPositions = async customPositions => {
  console.log(customPositions);
  return await fetch(`${baseUrl}/documents/diagram/nodes/positions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(customPositions),
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
  getYears,
  getNodesForDiagram,
  getEdgesForDiagram,
  getAreasAndPoints,
  getDocumentResources,
  fetchResource,
  deleteResource,
  getFilteredDocuments,
  updateDiagramPositions,
};
export default API;
