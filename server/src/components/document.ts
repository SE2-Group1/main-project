import { Link } from './link';

export class Resource {
  name: string;
  path: string;

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
  }
}

/**
 * Represents a document in the system.
 */
class Document {
  id_file: number;
  title: string;
  desc: string;
  scale: string;
  type: string;
  language: string;
  issuance_year: string;
  issuance_month: string | null;
  issuance_day: string | null;
  id_area: number;
  stakeholder: string[] | null;
  links: Link[] | null;
  resources: Resource[] | null;

  /**
   * Creates a new instance of the Document class.
   * @param id_file - The unique identifier of the document.
   * @param title - The title of the document.
   * @param desc - The description of the document.
   * @param scale - The scale of the document.
   * @param type - The type of the document.
   * @param language - The language of the document.
   * @param issuance_year - The year of issuance of the document.
   * @param issuance_month - The month of issuance of the document.
   * @param issuance_day - The day of issuance of the document.
   * @param id_area - The area of the document.
   * @param stakeholder - The stakeholders of the document.
   * @param links - The links of the document.
   * @param resources - The resources of the document.
   */

  constructor(
    id_file: number,
    title: string,
    desc: string,
    scale: string,
    type: string,
    language: string,
    issuance_year: string,
    issuance_month: string | null,
    issuance_day: string | null,
    id_area: number,
    stakeholder: string[] | null,
    links: Link[] | null,
    resources: Resource[] | null,
  ) {
    this.id_file = id_file;
    this.title = title;
    this.desc = desc;
    this.scale = scale;
    this.type = type;
    this.language = language;
    this.issuance_year = issuance_year;
    this.issuance_month = issuance_month;
    this.issuance_day = issuance_day;
    this.id_area = id_area;
    this.stakeholder = stakeholder;
    this.links = links;
    this.resources = resources;
  }
}

export { Document };
