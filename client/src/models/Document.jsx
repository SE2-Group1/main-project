class Document {
  constructor(
    title = '',
    stakeholders = [],
    scale = '',
    issuanceDate = { year: '', month: '', day: '' },
    type = '',
    language = '',
    description = '',
  ) {
    this.title = title;
    this.stakeholders = stakeholders;
    this.scale = scale;
    this.issuanceDate = issuanceDate;
    this.type = type;
    this.language = language;
    this.description = description;
    // this.georeference = georeference;
  }
}

export default Document;
