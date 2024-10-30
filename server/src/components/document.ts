/**
 * Represents a document in the system.
 */
class Document {
  id_file: number;
  title: string;
  desc: string;
  scale: string;
  issuance_date: string;
  type: DocumentType;
  language: string;
  pages: number | null;
  link: string | null;

  /**
   * Creates a new instance of the Document class.
   * @param id_file - The unique identifier of the document.
   * @param title - The title of the document.
   * @param desc - The description of the document.
   * @param scale - The scale of the document.
   * @param issuance_date - The issuance date of the document.
   * @param type - The type of the document.
   * @param language - The language of the document.
   * @param pages - The number of pages in the document.
   * @param link - The link to the document.
   */
  constructor(
    id_file: number,
    title: string,
    desc: string,
    scale: string,
    issuance_date: string,
    type: DocumentType,
    language: string,
    pages: number | null,
    link: string | null,
  ) {
    this.id_file = id_file;
    this.title = title;
    this.desc = desc;
    this.scale = scale;
    this.issuance_date = issuance_date;
    this.type = type;
    this.language = language;
    this.pages = pages;
    this.link = link;
  }
}

/**
 * Represents the type of a document.
 * The values present in this enum are the only valid values for the type of a document.
 */
enum DocumentType {
  INFORMATIVE = 'Informative',
  DESIGN = 'Design',
  TECHNICAL = 'Technical',
  PRESCRIPTIVE = 'Prescriptive',
}

export { Document, DocumentType };
