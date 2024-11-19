class Document {
  constructor(
    title = '',
    stakeholders = [],
    scale = '',
    issuanceDate = { year: '', month: null, day: null },
    type = '',
    language = null,
    pages = null,
    description = '',
    id_area = 1,
  ) {
    this.title = title;
    this.stakeholders = stakeholders;
    this.scale = scale;
    this.issuanceDate = issuanceDate; // Store as a Date object
    this.type = type;
    this.language = language;
    this.pages = pages;
    this.description = description;
    this.id_area = id_area;
  }
}

export default Document;
