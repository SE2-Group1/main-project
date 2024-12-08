class Document {
  constructor(
    title = '',
    stakeholders = [],
    scale = '',
    issuanceDate = { year: '', month: null, day: null },
    type = '',
    language = null,
    description = '',
    id_area = null,
    georeference = null,
  ) {
    this.title = title;
    this.stakeholders = stakeholders;
    this.scale = scale;
    this.issuanceDate = issuanceDate; // Store as a Date object
    this.type = type;
    this.language = language;
    this.description = description;
    this.id_area = id_area;
    this.georeference = georeference;
  }
}

export default Document;
