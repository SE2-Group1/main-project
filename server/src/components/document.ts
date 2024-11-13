import { Link } from './link';

/**
 * Represents a document in the system.
 */
class Document {
  id_file: number;
  title: string;
  desc: string;
  scale: string;
  issuance_date: string;
  type: string;
  language: string;
  link: string | null;
  pages: string | null;
  stakeholder: string[] | null;
  links: Link[] | null;

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
   * @param stakeholder - The stakeholders of the document.
   * @param links - The links of the document.
   */
  constructor(
    id_file: number,
    title: string,
    desc: string,
    scale: string,
    issuance_date: string,
    type: string,
    language: string,
    link: string | null,
    pages: string | null,
    stakeholder: string[] | null,
    links: Link[] | null,
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
    this.stakeholder = stakeholder;
    this.links = links;
  }
}

export { Document };
