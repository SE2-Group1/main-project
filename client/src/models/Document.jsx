class Document {
  /**
   * @param {string} title - The title of the document (required).
   * @param {number[]} stakeholders - An array of stakeholder IDs (optional).
   * @param {string} scale - The scale of the document (required).
   * @param {Date} issuanceDate - The issuance date of the document as a Date object (required).
   * @param {string} type - The type of the document (required).
   * @param {string} language - The language of the document (optional).
   * @param {string} pages - The number of pages in the document (optional).
   * @param {string} description - A description of the document (required).
   * @param {Connection[]} connection - An array of links.
   */

  constructor(
    title = '',
    stakeholders = [],
    scale = '',
    issuanceDate = { year: '', month: '', day: '' },
    type = '',
    language = '',
    link = null,
    pages = 0,
    description = '',
    connections = [],
  ) {
    this.title = title;
    this.stakeholders = stakeholders;
    this.scale = scale;
    this.issuanceDate = issuanceDate; // Store as a Date object
    this.type = type;
    this.language = language;
    this.link = link;
    this.pages = pages;
    this.description = description;
    this.connections = connections;
    // this.georeference = georeference;
  }
}

export default Document;
