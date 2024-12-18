import { getIconByType } from './map.js';

export const prioritizeDocsByLinkCount = (docId, a, b) => {
  const aHasLink = a.links.some(conn => conn.docId === docId);
  const bHasLink = b.links.some(conn => conn.docId === docId);

  if (aHasLink && !bHasLink) return -1;
  if (!aHasLink && bHasLink) return 1;
  return a.title.localeCompare(b.title);
};

/**
 * This function takes stakeholders as an input and returns the appropriate URL of the document's icon
 */
export const mapIcon = (stakeholders, doctype) => {
  console.log(stakeholders);
  const baseUrl = '/icons/map_icons/';
  const includesAll = (...keys) =>
    keys.every(key => stakeholders.includes(key));

  if (stakeholders.includes('Kiruna kommun')) {
    getIconForKiruna(doctype, baseUrl);
  }
  if (stakeholders.includes('Norrbotten Museum')) {
    getIconForNorrbotten(doctype, baseUrl);
  }
  if (stakeholders.includes('Architecture firms')) {
    getIconForArchitecture(doctype, baseUrl);
  }
  if (stakeholders.includes('Others')) {
    getIconForOthers(doctype, baseUrl);
  }
  if (includesAll('LKAB', 'Municipality', 'Norrbotten Museum')) {
    if (doctype === 'Agreement')
      return `${baseUrl}agreementmunicipalty+county+lkab.png`;
  }
  if (includesAll('Municipality', 'Norrbotten Museum')) {
    if (doctype === 'Agreement')
      return `${baseUrl}agreementmunicipalty+county.png`;
    if (doctype === 'Conflict')
      return `${baseUrl}conflictMunicipalty+county.png`;
  }
  if (includesAll('Municipality', 'LKAB')) {
    if (doctype === 'Agreement')
      return `${baseUrl}agreementmunicipalty+county.png`;
    if (doctype === 'Consultation')
      return `${baseUrl}ConsultationLKAB+municipalty.png`;
  }
  if (includesAll('Municipality', 'Citizens')) {
    if (doctype === 'Consultation')
      return `${baseUrl}Consultationmunicipalty+citizens.png`;
  }
  if (includesAll('Architecture firms', 'LKAB')) {
    if (doctype === 'Design')
      return `${baseUrl}deesigndocLKAB+architecturefirms.png`;
    if (doctype === 'Technical')
      return `${baseUrl}technicaldocLKAB+architecturefirms.png`;
  }
  if (includesAll('Municipality', 'Architecture firms')) {
    if (doctype === 'Design')
      return `${baseUrl}designdocmunicialty+architecturefirms.png`;
    if (doctype === 'Informative')
      return `${baseUrl}informativedocmunicipalty+architecturfirms.png`;
    if (doctype === 'Prescriptive')
      return `${baseUrl}prescriptivedocmunicipalty+architecturalfirms.png`;
    if (doctype === 'Technical')
      return `${baseUrl}technicaldocmunicipalty+ firms.png`;
  }
  if (includesAll('Municipality', 'Norrbotten Museum', 'Population')) {
    if (doctype === 'Informative')
      return `${baseUrl}informativedocmunicipalty+population.png`;
  }
  if (stakeholders.includes('LKAB')) {
    getIconForLKAB(doctype, baseUrl);
  }

  return getIconByType(doctype);
};

const getIconForKiruna = (doctype, baseUrl) => {
  switch (doctype) {
    case 'Agreement':
      return `${baseUrl}agreementmunicipalty.png`;
    case 'Informative':
      return `${baseUrl}informativedocmunicipalty.png`;
    case 'Prescriptive':
      return `${baseUrl}prescriptivedocmunicipalty.png`;
    case 'Technical':
      return `${baseUrl}technicaldocmunicipalty.png`;
    case 'Design':
      return `${baseUrl}designdocmunicipalty.png`;
  }
};

const getIconForNorrbotten = (doctype, baseUrl) => {
  switch (doctype) {
    case 'Agreement':
      return `${baseUrl}agreementcounty.png`;
    case 'Technical':
      return `${baseUrl}technicaldocCounty.png`;
  }
};

const getIconForArchitecture = (doctype, baseUrl) => {
  switch (doctype) {
    case 'Design':
      return `${baseUrl}designdocarchitecturefirms.png`;
    case 'Informative':
      return `${baseUrl}informativedocarchitecturefirms.png`;
    case 'Technical':
      return `${baseUrl}techicaldocarchitecturefirms.png`;
  }
};

const getIconForOthers = (doctype, baseUrl) => {
  switch (doctype) {
    case 'Design':
      return `${baseUrl}designdocothers.png`;
    case 'Informative':
      return `${baseUrl}informativedocothers.png`;
    case 'Action':
      return `${baseUrl}materialactionothers.png`;
    case 'Prescriptive':
      return `${baseUrl}prescriptivedocothers.png`;
  }
};

const getIconForLKAB = (doctype, baseUrl) => {
  switch (doctype) {
    case 'Technical':
      return `${baseUrl}technicaldocLKAB.png`;
    case 'Action':
      return `${baseUrl}materialaction LKAB.png`;
    case 'Informative':
      return `${baseUrl}informativedocLKAB.png`;
  }
};
