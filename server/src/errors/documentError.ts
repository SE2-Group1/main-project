const DOCUMENT_NOT_FOUND = 'The document does not exist';

/**
 * Represents an error that occurs when a document is not found.
 */

class DocumentNotFoundError extends Error {
  customMessage: string;
  customCode: number;

  constructor() {
    super();
    this.customMessage = DOCUMENT_NOT_FOUND;
    this.customCode = 404;
  }
}

export { DocumentNotFoundError };
