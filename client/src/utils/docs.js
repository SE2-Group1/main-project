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
      return `${baseUrl}agreement municipalty +county +lkab.png`;
  }
  if (includesAll('Municipality', 'Norrbotten Museum')) {
    if (doctype === 'Agreement')
      return `${baseUrl}agreement municipalty +county.png`;
    if (doctype === 'Conflict')
      return `${baseUrl}conflict Municipalty+ county.png`;
  }
  if (includesAll('Municipality', 'LKAB')) {
    if (doctype === 'Agreement')
      return `${baseUrl}agreement municipalty +county.png`;
    if (doctype === 'Consultation')
      return `${baseUrl}Consultation LKAB+municipalty.png`;
  }
  if (includesAll('Municipality', 'Citizens')) {
    if (doctype === 'Consultation')
      return `${baseUrl}Consultation municipalty+citizens.png`;
  }
  if (includesAll('Architecture firms', 'LKAB')) {
    if (doctype === 'Design')
      return `${baseUrl}deesign doc LKAB + architecture firms.png`;
    if (doctype === 'Technical')
      return `${baseUrl}technical doc LKAB + architecture firms.png`;
  }
  if (includesAll('Municipality', 'Architecture firms')) {
    if (doctype === 'Design')
      return `${baseUrl}design doc municialty+ architecture firms.png`;
    if (doctype === 'Informative')
      return `${baseUrl}informative doc municipalty+architectur firms.png`;
    if (doctype === 'Prescriptive')
      return `${baseUrl}prescriptive doc municipalty +architectural firms.png`;
    if (doctype === 'Technical')
      return `${baseUrl}technical doc municipalty+ firms.png`;
  }
  if (includesAll('Municipality', 'Norrbotten Museum', 'Population')) {
    if (doctype === 'Informative')
      return `${baseUrl}informative doc municipalty+ population.png`;
  }
  if (stakeholders.includes('LKAB')) {
    getIconForLKAB(doctype, baseUrl);
  }
  console.log('doctype');
  console.log(doctype);
  return getIconByType(doctype);
};

const getIconForKiruna = (doctype, baseUrl) => {
  switch (doctype) {
    case 'Agreement':
      return `${baseUrl}agreement municipalty.png`;
    case 'Informative':
      return `${baseUrl}informative doc municipalty.png`;
    case 'Prescriptive':
      return `${baseUrl}prescriptive doc municipalty.png`;
    case 'Technical':
      return `${baseUrl}technical doc municipalty.png`;
    case 'Design':
      return `${baseUrl}design doc municipalty.png`;
  }
};

const getIconForNorrbotten = (doctype, baseUrl) => {
  switch (doctype) {
    case 'Agreement':
      return `${baseUrl}agreement county.png`;
    case 'Technical':
      return `${baseUrl}technical doc County.png`;
  }
};

const getIconForArchitecture = (doctype, baseUrl) => {
  switch (doctype) {
    case 'Design':
      return `${baseUrl}design doc architecture firms.png`;
    case 'Informative':
      return `${baseUrl}informative doc architecture firms.png`;
    case 'Technical':
      return `${baseUrl}techical doc architecture firms.png`;
  }
};

const getIconForOthers = (doctype, baseUrl) => {
  switch (doctype) {
    case 'Design':
      return `${baseUrl}design doc others.png`;
    case 'Informative':
      return `${baseUrl}informative doc others.png`;
    case 'Action':
      return `${baseUrl}material action others.png`;
    case 'Prescriptive':
      return `${baseUrl}prescriptive doc  others.png`;
  }
};

const getIconForLKAB = (doctype, baseUrl) => {
  switch (doctype) {
    case 'Technical':
      return `${baseUrl}technical doc LKAB.png`;
    case 'Action':
      return `${baseUrl}material action LKAB.png`;
    case 'Informative':
      return `${baseUrl}informative doc LKAB.png`;
  }
};
