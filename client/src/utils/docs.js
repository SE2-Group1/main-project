import { getIconByType } from './map.js';

export const prioritizeDocsByLinkCount = (docId, a, b) => {
  const aHasLink = a.links.some(conn => conn.docId === docId);
  const bHasLink = b.links.some(conn => conn.docId === docId);

  if (aHasLink && !bHasLink) return -1;
  if (!aHasLink && bHasLink) return 1;
  return a.title.localeCompare(b.title);
};
const baseUrl = '/icons/map_icons/';

const iconMapping = {
  'Kiruna kommun': {
    Agreement: 'agreementmunicipalty.png',
    Informative: 'informativedocmunicipalty.png',
    Prescriptive: 'prescriptivedocmunicipalty.png',
    Technical: 'technicaldocmunicipalty.png',
    Design: 'designdocmunicipalty.png',
  },
  'Norrbotten Museum': {
    Agreement: 'agreementcounty.png',
    Technical: 'technicaldocCounty.png',
  },
  'Architecture firms': {
    Design: 'designdocarchitecturefirms.png',
    Informative: 'informativedocarchitecturefirms.png',
    Technical: 'techicaldocarchitecturefirms.png',
  },
  Others: {
    Design: 'designdocothers.png',
    Informative: 'informativedocothers.png',
    'Material effects': 'materialactionothers.png',
    Prescriptive: 'prescriptivedocothers.png',
  },
  LKAB: {
    Technical: 'technicaldocLKAB.png',
    'Material effects': 'materialactionLKAB.png',
    Informative: 'informativedocLKAB.png',
  },
  Municipality: {
    Agreement: 'agreementmunicipalty.png',
    Conflict: 'conflictMunicipalty.png',
    Consultation: 'Consultationmunicipalty.png',
    Informative: 'informativedocmunicipalty.png',
    Prescriptive: 'prescriptivedocmunicipalty.png',
    Technical: 'technicaldocmunicipalty.png',
    Design: 'designdocmunicialty.png',
  },
  Population: {
    Informative: 'informativedocmunicipalty+population.png',
  },
};

const includesAll = (stakeholders, ...keys) =>
  keys.every(key => stakeholders.includes(key));

export const mapIcon = (stakeholders, doctype) => {
  if (
    includesAll(stakeholders, 'LKAB', 'Municipality', 'Norrbotten Museum') &&
    doctype === 'Agreement'
  ) {
    return `${baseUrl}agreementmunicipalty+county+lkab.png`;
  }
  if (
    includesAll(stakeholders, 'Municipality', 'Norrbotten Museum') &&
    doctype === 'Agreement'
  ) {
    return `${baseUrl}agreementmunicipalty+county.png`;
  }
  if (
    includesAll(stakeholders, 'Municipality', 'LKAB') &&
    doctype === 'Agreement'
  ) {
    return `${baseUrl}agreementmunicipalty+county.png`;
  }
  if (
    includesAll(stakeholders, 'Municipality', 'LKAB') &&
    doctype === 'Consultation'
  ) {
    return `${baseUrl}ConsultationLKAB+municipalty.png`;
  }
  if (
    includesAll(stakeholders, 'Municipality', 'Citizens') &&
    doctype === 'Consultation'
  ) {
    return `${baseUrl}Consultationmunicipalty+citizens.png`;
  }
  if (
    includesAll(stakeholders, 'Architecture firms', 'LKAB') &&
    doctype === 'Design'
  ) {
    return `${baseUrl}deesigndocLKAB+architecturefirms.png`;
  }
  if (
    includesAll(stakeholders, 'Municipality', 'Architecture firms') &&
    doctype === 'Design'
  ) {
    return `${baseUrl}designdocmunicialty+architecturefirms.png`;
  }

  for (const stakeholder of stakeholders) {
    if (iconMapping[stakeholder] && iconMapping[stakeholder][doctype]) {
      return `${baseUrl}${iconMapping[stakeholder][doctype]}`;
    }
  }

  // Caso di fallback per il tipo di documento
  return getIconByType(doctype);
};
