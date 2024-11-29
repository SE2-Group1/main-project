const DOCUMENT_NOT_FOUND = 'The document does not exist';
const DOCUMENT_TYPE_NOT_FOUND = 'The document type does not exist';
const DOCUMENT_SCALE_NOT_FOUND = 'The document scale does not exist';
const DOCUMENT_LANGUAGE_NOT_FOUND = 'The document language does not exist';
const DOCUMENT_AREA_NOT_FOUND = 'The document area does not exist';
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

/**
 * Represents an error that occurs when a document type is not found.
 * @extends Error
 * @param {string} message - The error message.
 * @param {number} code - The error code.
 */

class DocumentTypeNotFoundError extends Error {
  customMessage: string;
  customCode: number;

  constructor() {
    super();
    this.customMessage = DOCUMENT_TYPE_NOT_FOUND;
    this.customCode = 404;
  }
}

/**
 * Represents an error that occurs when a document scale is not found.
 * @extends Error
 * @param {string} message - The error message.
 * @param {number} code - The error code.
 * @returns {DocumentScaleNotFoundError} The error object.
 */

class DocumentScaleNotFoundError extends Error {
  customMessage: string;
  customCode: number;

  constructor() {
    super();
    this.customMessage = DOCUMENT_SCALE_NOT_FOUND;
    this.customCode = 404;
  }
}

/**
 * Represents an error that occurs when a document language is not found.
 * @extends Error
 * @param {string} message - The error message.
 * @param {number} code - The error code.
 * @returns {DocumentLanguageNotFoundError} The error object.
 */

class DocumentLanguageNotFoundError extends Error {
  customMessage: string;
  customCode: number;

  constructor() {
    super();
    this.customMessage = DOCUMENT_LANGUAGE_NOT_FOUND;
    this.customCode = 404;
  }
}

/**
 * Represents an error that occurs when a document area is not found.
 * @extends Error
 * @param {string} message - The error message.
 * @param {number} code - The error code.
 * @returns {DocumentAreaNotFoundError} The error object.
 */
class DocumentAreaNotFoundError extends Error {
  customMessage: string;
  customCode: number;

  constructor() {
    super();
    this.customMessage = DOCUMENT_AREA_NOT_FOUND;
    this.customCode = 404;
  }
}

export {
  DocumentNotFoundError,
  DocumentTypeNotFoundError,
  DocumentScaleNotFoundError,
  DocumentLanguageNotFoundError,
  DocumentAreaNotFoundError,
};
