const LINK_TYPE_NOT_FOUND = 'The link type was not found.';
export class LinkTypeNotFoundError extends Error {
  customMessage: string;
  customCode: number;
  constructor() {
    super();
    this.customMessage = LINK_TYPE_NOT_FOUND;
    this.customCode = 404;
  }
}
